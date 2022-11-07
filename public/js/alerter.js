function generateAlertElements() {
    // create elements
    Alerter.$form = document.createElement("form");
    Alerter.$form.addEventListener("submit", function (e) {
        e.preventDefault();
    });
    Alerter.$form.action = '#safari-puppet';

    Alerter.$icon = document.createElement("i");
    Alerter.$icon.classList.add('material-icons');

    Alerter.$alertInfo = document.createElement("div");

    Alerter.$title = document.createElement("h1");

    Alerter.$text = document.createElement("p");

    Alerter.$styledInput = document.createElement('div');
    Alerter.$styledInput.classList.add('styled-input');
    Alerter.$input = document.createElement("input");
    Alerter.$input.classList.add('shadowed');
    Alerter.$input.setAttribute('type', 'text');
    Alerter.$input.setAttribute('required', 'true');
    Alerter.$inputButton = document.createElement("button");
    var inputButtonIcon = document.createElement('i');
    inputButtonIcon.classList.add('material-icons');
    inputButtonIcon.innerHTML = 'arrow_forward';
    Alerter.$inputButton.appendChild(inputButtonIcon);
    Alerter.$input.oninput = function (e) {
        var $arrow = Alerter.$inputButton.querySelector("i");
        if (e.target.value != '') {
            $arrow.style.opacity = 1;
        } else {
            $arrow.style.opacity = 0;
        }
    };
    Alerter.$inputButton.setAttribute('onClick', "Alerter.close()");
    Alerter.$inputButton.setAttribute('type', "submit");
    Alerter.$styledInput.appendChild(Alerter.$input);
    Alerter.$styledInput.appendChild(Alerter.$inputButton);

    Alerter.$button = document.createElement('button');
    Alerter.$button.setAttribute('onClick', "Alerter.close()");
    Alerter.$button.classList.add('styled-button');
    Alerter.$button.classList.add('shadowed');

    // append elements
    Alerter.$e.appendChild(Alerter.$form);
    Alerter.$form.appendChild(Alerter.$icon);
    Alerter.$form.appendChild(Alerter.$alertInfo);
    Alerter.$alertInfo.appendChild(Alerter.$title);
    Alerter.$alertInfo.appendChild(Alerter.$text);
    Alerter.$alertInfo.appendChild(Alerter.$styledInput);
    Alerter.$form.appendChild(Alerter.$button);
}

var Alerter = {
    $e: null,
    $form: null,
    $icon: null,
    $alertInfo: null,
    $title: null,
    $text: null,
    $styledInput: null,
    $input: null,
    $inputButton: null,
    $button: null,
    timeouts: {
        onShow: null,
        onClose: null
    },
    actions: null,
    stack: [],
    init: function (alert, actions) {
        if (!(alert instanceof HTMLElement && actions)) { return false; }
        this.actions = actions;
        this.$e = alert;
        generateAlertElements();
        return true;
    },
    show: function showAlert(type) {
        var options = this.actions[type].options();
        this.stack.push({ type: type, data: (options.hasOwnProperty('input')) ? true : false });
        if (this.timeouts.onClose) { clearTimeout(this.timeouts.onClose); }
        this.$form.style.opacity = 0;
        this.timeouts.onShow = setTimeout(function () {
            this.reset(options);
            // if there is an onShow action, execute it
            if (this.actions[type].onShow) { this.actions[type].onShow(); }
            this.$form.style.opacity = 1;
        }.bind(this), 200);
        this.$e.style.visibility = "visible";
        this.$e.style.opacity = 1;
    },
    close: function closeAlert(force) {
        // check onShow timeout
        if (this.timeouts.onShow) { clearTimeout(this.timeouts.onShow); }
        // manage stack on closing
        if (this.stack.length == 0) { return; }
        var last;
        if (force) { this.stack = []; }
        else { last = this.stack.pop(); }
        // get the input value if needed
        var data;
        if (last && last.data) {
            if (this.$input) {
                // get data of the input element if there's one
                data = this.$input.value;
                // return if value is empty (but repush popped alert)
                if (!data) { this.stack.push(last); return; }
            }
        }
        // check for alert type and run the onClose function if present
        if (!force && this.actions[last.type].onClose) {
            this.actions[last.type].onClose(data);
        }
        // graphically close the alert
        this.$form.style.opacity = 0;
        this.$e.style.opacity = 0;
        this.timeouts.onClose = setTimeout(function () {
            this.$e.style.visibility = "hidden";
            this.reset({});
        }.bind(this), 200); // for style purpose only
    },
    reset: function resetAlert(options) {
        this.$title.innerHTML = (options.title || "");
        this.$text.innerHTML = (options.text || "");
        this.$button.innerHTML = (options.button || "");
        this.$button.style.display = (options.button) ? "block" : "none";
        this.$inputButton.style.opacity = "0";
        if (options.hasOwnProperty('input')) {
            this.$form.removeAttribute('novalidate');
            this.$input.value = options.input;
            this.$input.style.display = "block";
            this.$inputButton.style.display = "block";
            this.$inputButton.style.opacity = "1";
            this.$inputButton.querySelector('i').style.opacity = "1";
            this.$input.focus();
        } else {
            this.$form.setAttribute('novalidate', true);
            this.$input.value = "";
            this.$input.style.display = "none";
            this.$inputButton.style.display = "none";
            this.$inputButton.style.opacity = "0";
            this.$inputButton.querySelector('i').style.opacity = "0";
        }
        this.$icon.innerHTML = options.icon;
        this.$icon.style.display = (options.icon) ? "block" : "none";
        this.$icon.style.opacity = (options.icon) ? "1" : "0";
    }
}