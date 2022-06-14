import {asyncReadFile, writeToTxtFile} from './txtFilesHandler.js';
import {IpGenerator} from './IpGenerator.js';
import pck from 'simple-node-logger';
import axios from 'axios';

const {createSimpleLogger} = pck;

const formatYmd = (givenDate) => givenDate.toISOString().slice(0, 10);
const formatYmdHour = (givenFullDate) => givenFullDate.toISOString().slice(0, 19);
const fullDate = formatYmdHour(new Date);
const date = formatYmd(new Date());

// global variables
const log = createSimpleLogger(`./logs/${fullDate}.log`);
let IS_FOUND = false;
let globalReqCounter = 0;
let leadWord = '';
let leadDistance = 0;

const getTimeWithMs = () => {
  const currDate = new Date();
  return currDate.toISOString().slice(11, 22);
};

// Copy of batch-request-js with stop(IS_FOUND) functionality
const batchRequest = (records, request = () => {}, options = {batchSize: 100, delay: 100}) => {
  return new Promise(async (resolve) => {
    let response = [];
    const data = [];
    const error = [];

    for (let i = 0; i < records.length; i += options.batchSize) {
      if (IS_FOUND) break;
      const batch = records.slice(i, i + options.batchSize);
      // capture individual errors
      // as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all#Promise.all_fail-fast_behaviour
      const result = await Promise.all(
          batch.map((record) => request(record).catch((e) => ({record, error: new Error(e)}))),
      );
      response = response.concat(result);
      await delay(options.delay);
    }
    // separate successful requests from errors
    response.forEach((res) => {
            res && (res.error instanceof Error) ? error.push(res) : data.push(res);
    });
    resolve({
      error,
      data,
    });
  });
};

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const setLeadWord = (distance, word) => {
  if (distance > leadDistance) {
    leadWord = word;
    leadDistance = distance;
  }
};

const writeGoodWordsLog = (content) => {
  log.info(content);
  const path = `./good_words_${date}.txt`;
  writeToTxtFile(path, content, log);
};

const writeReqLog = (reqLogContent) => {
  const path = `./logs/requests/${fullDate}.txt`;
  writeToTxtFile(path, reqLogContent, log);
};

let failedWords = [];
const API_ENDPOINT='https://semantle-he.herokuapp.com/api/distance?word=';

const getSecretWord = async () => {
  const words = hebWordsArr;
  const request = (word) => makeGetRequest(`${API_ENDPOINT}${word}`, word)
      .then((response) => {
        const similarity = response?.similarity;
        const distance = response?.distance;

        if (distance > 0) {
          const content = `similarity: ${similarity} distance: ${distance} word: ${word}`;
          writeGoodWordsLog(content);

          if (distance === 1000) {
            setLeadWord(distance, word);
            IS_FOUND = true;
            writeGoodWordsLog(`######## You cracked it! The secret word is: ${word}`);
          }
        }
      }).catch(() => {
        failedWords.push(word);
        log.info(`Failed word added: ${word}`);
      });

  const batchSize = 2000; // Increase this variable if you don't have errors
  const delayMs = 200; // Decrease this variable if you don't have errors

  log.info(`BatchSize: ${batchSize}. Delay: ${delayMs}`);
  await batchRequest(words, request, {batchSize: batchSize, delay: delayMs, killProcess: IS_FOUND});
  let retryCounter = 0;

  // Retry failed reqs
  while (failedWords.length > 0) {
    log.info(`Starting Failed Words List #${retryCounter} , with ${failedWords.length} records`);
    if (++retryCounter > 5) break;
    const updateFailedWords = [...failedWords];
    failedWords = []; // reset failed words list

    // Starting retry with lower batchSize and greater delay
    await batchRequest(updateFailedWords, request, {batchSize: batchSize/2, delay: delayMs*2});
  }
};

const ipGenerator = new IpGenerator();
const makeGetRequest = (path, word) => {
  const ip = ipGenerator.getNextIp();
  const reqLogContent = `#${++globalReqCounter} ${getTimeWithMs()} IP: ${ip} Word: ${word}`;
  writeReqLog(reqLogContent);

  return new Promise(function(resolve, reject) {
    const encodedUrl = encodeURI(path);
    axios.get(encodedUrl, {
      headers: {
        'X-Forwarded-For': ip,
      },
    }).then(
        (response) => {
          const result = response.data;
          resolve(result, word);
        },
        (error) => {
          reject(error);
        },
    );
  });
};


// Run
log.info('############################## Starting! ##################');
log.info('Loading all the words from txt file into an array...');
const hebWordsArr = await asyncReadFile('./all_heb_words_filtered.txt', log);
log.info('Finish! Words Array Length: ', hebWordsArr.length);

log.info('Cracking starting now. Have a cup of tea and wait for the results');
const startDate = new Date();
await getSecretWord();
const endDate = new Date();

// End of operation logs
log.info(`'The word '${leadWord} is the leading word with distance of ${leadDistance} !`);
log.info(`The cracking took ${Math.round((endDate - startDate) /1000)} seconds!`);
