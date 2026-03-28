// import { replyChats } from "../service";
import i18n from 'i18n';
import { updateOption } from '../dao/optionDao';
import { updateOptions } from '../service';

const { Client, RemoteAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const mongoose = require("mongoose");
const { MongoStore } = require("wwebjs-mongo");
require("dotenv").config();

// Declare the client variable globally to be accessed by other functions
let client;

// Function to start the WhatsApp bot
export const startWhatsAppBot = async (options) => {
  try {
    console.log("Starting Whatsapp.....")
    await mongoose.connect(process.env.MONGODB_URI);
    const store = new MongoStore({ mongoose: mongoose });
    client = new Client({
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      },
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
      }),
    });

    client.on("remote_session_saved", (obj) => {
      store.save({ session: "yourSessionName" });
    });

    client.on("qr", (qr) => {
      updateOptions('QR',qr)
      qrcode.generate(qr, { small: true });
    });

    client.on("message", (message) => {
      if (message.body === "!ping") {
        message.reply("pong");
      }
      // replyChats(message)
    });

    client.on("ready", () => {
      console.log("Client is ready!");
    });

    client.on("error", (error) => {
      console.log(error);
    });

    await client.initialize();
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

export const sendWhatsApp = async (params) => {
  console.log(params)
  const { to, template, data } = params;
  const message = i18n.__(`${template}.SMS`, data);
  const text = message.replace(/&#x2F;/g, "/");
  console.log(text)
  try {
    if (client) {
      client.sendMessage(`${to}@c.us`, text);
    } else {
      console.error("Client is not initialized.");
    }
  } catch (err) {
    console.log(err);
  }
};
