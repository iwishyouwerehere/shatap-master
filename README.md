# SHATAPP
### *Create, join, anonymously*

> [Demo Preview *not available yet*]()

> version 0.2.0

## Info
Shatapp is a nodejs client-server application for anonymous chatting.

No personal data is stored or sent to the server, join shatapp by only entering a personal password (key). It will be then stored locally and used for recognize you in the chat system.

#### The encryption system
Messages sent are client encrypted so the server can't decrypt or understand them. The client-side use the entered password as encryption key. Doing so allows anyone to possibly read messages but only who has the original password can decrypt and understand what's really written.

#### The chat system
For chatting you have to enter a chatroom. Everyone can create a chat and join it. Chats are not private or protected and their names are randomly generated. Everyone who has joined a chatroom receives all messages sent in that chatroom, even if he has entered a different password, but can "see" only those who can decrypt. Joining a chat gives you a randomly generated username, just refresh the page to get a new one.

Moreover, chats are deleted based on the lifetime option you specified at the creation (preset minutes and hours timers), or after a 24 hours of inactivity, so that you leave no tracks.

## Help
Any kind of help would be really appreciated. [Here](CONTRIBUTING.md) there is the contributing guide.

## Authors
> Kristian Notari, Farouk Serragedine
