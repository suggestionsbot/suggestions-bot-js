FROM node:latest

#Create the directory
RUN mkdir -p /usr/src/nerd-suggestions
WORKDIR /usr/src/nerd-suggestions

#Copy and install the bot
COPY package.json /usr/src/nerd-suggestions
RUN npm install

#Now this is the bot
COPY . /usr/src/nerd-suggestions

#Start the bot!
CMD ["node", "app.js"]
