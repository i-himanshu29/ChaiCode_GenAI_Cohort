import { Tiktoken } from 'js-tiktoken/lite';
import o200k_base from 'js-tiktoken/ranks/o200k_base';

const enc = new Tiktoken(o200k_base);

const userQuery = 'Hey There, I am Himanshu Maurya';
const tokens = enc.encode(userQuery);

console.log({ tokens });

const inputTokens = [25216, 3274, 11, 357, 939, 398, 3403, 1776, 170676];
const decoded = enc.decode(inputTokens);
console.log({ decoded });

// // Suppose you want to make your own gpt

// function predictNextToken(tokens){
//     //magic code
//     return 6789; // dummy token id
// }

// while(true){
//     const nextToken = predictNextToken(tokens);
//     if(nextToken === 50256) break; // assuming 50256 is the end-of-text token
//     tokens.push(nextToken);
//     const decodedText = enc.decode(tokens);
//     console.log(decodedText);
// }