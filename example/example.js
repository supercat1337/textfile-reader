// @ts-check

import { TextFileReader } from "../index.js";

const textFileReader = new TextFileReader();

textFileReader.openFile("./example/test.txt");
//textFileReader.resetSettings();

await textFileReader.read((line, lineNumber) => {
    console.log(lineNumber, ":", line);
    textFileReader.stop();
    //throw new Error("test");
});
