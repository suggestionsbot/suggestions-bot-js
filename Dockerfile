FROM node:lts

#Update container and install vim
RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim-tiny", "apt-utils"]

#Create the directory
RUN mkdir -p /usr/src/suggestions-bot
WORKDIR /usr/src/suggestions-bot

#Copy package.json and lockfile
COPY package.json ./
COPY package-lock.json ./

#Install from package.json
RUN npm install

#Copy remaining files
COPY . .

#Set enivornment variables (this MUST be done BEFORE copying rest of files)
ENV NODE_ENV=production

#Start the bot!
CMD ["npm", "start"]
