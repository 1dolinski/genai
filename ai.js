import 'dotenv/config'
import OpenAI from 'openai';

import { promises as fs } from "fs";
import { exec } from "child_process";

import data from "./APIs/airstack.js";

const warpcastData = data.FarcasterCasts.Cast.map((cast) => {
    return {
        castedAtTimestamp: cast.castedAtTimestamp,
        text: cast.text,
        channel: cast.channel && cast.channel.name || '',
    };
    }).join("\n");

    console.log(warpcastData);

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], 
});

async function runGitCommands() {
    try {
        await execAsync('git diff --unified=0 HEAD >> gitlog.txt');
        console.log("Git log written to gitlog.txt.");

        await execAsync("git add .");
        console.log("Files added to git.");

        await execAsync('git commit -m "ai save"');
        console.log("Changes committed to git.");

    } catch (error) {
        console.error(`Error running git commands: ${error.message}`);
        console.log("continuing...");
    } finally{
    }
}

async function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                reject(new Error(stderr));
                return;
            }
            resolve(stdout);
        });
    });
}

async function main() {
    const daily = await fs.readFile("daily.txt", "utf8");
    const todoUpcomingDone = await fs.readFile("todoUpcomingDone.txt", "utf8");
    const initiatives = await fs.readFile("initiatives.txt", "utf8");
    const userState = await fs.readFile("userState.txt", "utf8");
    const questions = await fs.readFile("questions.txt", "utf8");
    const gitlog = await fs.readFile("gitlog.txt", "utf8");
    const currentTime = new Date().toLocaleString();

    runGitCommands();

    const instructions = `
    You are a all knowing AI assistant, named @Ami. You're going to help me reach all of my goals over a period of time, faster and with integrity is best.
    
    I have a few free hours, please outline what I should do. Please ask 3 questions that would help you help me better.

    Recently I've also been posting on Warpcast, a web3 social media platform. Here are some of the posts I've made: ${warpcastData}

    I have a set of files to track all the input data about me. Treat the data provided as truth:
    I'll write out my thoughts in a file called daily.txt. Each day will have a header in the format of "*** MMM dd***" where MMM is the month and dd is the day. 
    I'll write out what I need to do, what I've done and what's upcoming in a file called todoUpcomingDone.txt
    I'll write the current state of myself in a file called userState.txt
    I'll write my current initiatives in a file called initiatives.txt
    All questions you proide, I will answer in a file called questions.txt

    We'll use git to track changes of the files so you can see the updates in gitlog.txt. The current time is ${currentTime}
    Here are the files
    daily.txt
    ${daily} 

    todoUpcomingDone.txt
    ${todoUpcomingDone}

    userState.txt
    ${userState}

    initiatives.txt
    ${initiatives}

    questions.txt
    ${questions}

    gitlog.txt
    ${gitlog}
    `;
        
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: instructions }],
    model: 'gpt-4o',
  });

  console.log(chatCompletion.choices[0].message.content);
}

main();