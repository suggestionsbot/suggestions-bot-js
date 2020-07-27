FROM node:12.18.3

#Update container and install vim
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim-tiny", "apt-utils"]

#Create the directory
RUN mkdir -p /usr/src/suggestions-bot
WORKDIR /usr/src/suggestions-bot

#Copy and install the bot
COPY package.json /usr/src/suggestions-bot
RUN npm install

#Now this is the bot
COPY . /usr/src/suggestions-bot

#Start the bot!
CMD ["npm", "start"]
