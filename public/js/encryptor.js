var Encryptor = {
    cipher: null,
    decipher: null,
    options: {
        mode: 'ECB',
        iv: '',
        salt: '',
        password: ''
    },
    loadDependencies: function (callback) {
        var dependency = document.createElement('script');
        dependency.type = "text/javascript";
        if (dependency.readyState) {  //IE
            dependency.onreadystatechange = function () {
                if (dependency.readyState === "loaded" || dependency.readyState === "complete") {
                    dependency.onreadystatechange = null;
                    callback();
                }
            };
        } else {  //Others
            dependency.onload = function () {
                callback();
            };
        }
        dependency.src = 'https://unpkg.com/node-forge@0.7.0/dist/forge.min.js';
        document.head.appendChild(dependency);
        this.loadDependencies = null;
    },
    init: function init(options) {
        for (key in this.options) {
            if (this.options.hasOwnProperty(key)) {
                this.options[key] = options[key];
            }
        }
        if (this.options.mode == 'ECB') {
            this.options.key = forge.pkcs5.pbkdf2(this.options.password, this.options.salt || '', 1, 32);
        }

        this.cipher = forge.cipher.createCipher('AES-' + this.options.mode, this.options.key);
        this.decipher = forge.cipher.createDecipher('AES-' + this.options.mode, this.options.key);
    },
    /**
     * Encrypt
     * 
     * @param {any} data 
     * @returns 
     */
    encrypt: function encrypt(data) {
        this.cipher.start(this.options.iv ? { iv: this.options.iv } : {});        
        this.cipher.update(forge.util.createBuffer(data));
        this.cipher.finish();
        var encrypted = this.cipher.output;
        return this.cipher.output.toHex();
    },
    /**
     * Decrypt
     * 
     * @param {any} data 
     * @returns
     */
    decrypt: function decrypt(data) {
        data = forge.util.hexToBytes(data);
        this.decipher.start(this.options.iv ? { iv: this.options.iv } : {});        
        this.decipher.update(forge.util.createBuffer(data))
        this.decipher.finish();
        return this.decipher.output['data'];
    },
    randomize(type, length) {
        var random = forge.random.getBytesSync(length);
        switch (type) {
            case 'iv': {
                this.options.iv = random;
                break;
            }
            case 'salt': {
                this.options.salt = random;
                break;
            }
            default: {
                return forge.random.getBytesSync(length);
            }
        }
    }
}