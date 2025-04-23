// @ts-check

import test from "ava";
import fs from "node:fs";

import { TextFileReader } from "./index.js";

/**
 * Returns a promise that resolves after the given amount of milliseconds.
 * @param {number} ms - The amount of milliseconds to wait.
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test("TextFileReader", async (t) => {
    const textFileReader = new TextFileReader();
    let path = "./example/test.txt";

    textFileReader.openFile(path);
    textFileReader.resetSettings();

    var index = 0;

    await textFileReader.read((line, lineNumber) => {
        console.log(lineNumber, ":", line);
        index++;
        if (index == 4) {
            textFileReader.stop();
        }
    });

    t.is(index, 4);
    t.is(textFileReader.getPath(), path);
});

test("TextFileReader: openFile throws an error if file is already opened", async (t) => {
    const textFileReader = new TextFileReader();

    t.notThrows(() => {
        textFileReader.openFile("./example/test.txt");
    });

    t.throws(() => {
        textFileReader.openFile("./example/test.txt");
    });
});

test("TextFileReader: openFile throws an error if file does not exist", async (t) => {
    const textFileReader = new TextFileReader();

    t.throws(() => {
        textFileReader.openFile("./example/test1.txt");
    });
});

test("TextFileReader: openFile throws an error if file is not opened", async (t) => {
    const textFileReader = new TextFileReader();

    t.throws(() => {
        textFileReader.countLines();
    });

    t.throws(() => {
        textFileReader.resetSettings();
    });

    t.throws(() => {
        let path = textFileReader.getPath();
        console.log(path);
    });

    t.throws(() => {
        textFileReader.read(() => {});
    });
});

test("TextFileReader: openFile throws an error while file is reading", async (t) => {
    const textFileReader = new TextFileReader();
    textFileReader.openFile("./example/test.txt");

    textFileReader.read(async () => {
        await sleep(1000);
        textFileReader.stop();
    });

    t.throws(() => {
        textFileReader.resetSettings();
    });

    t.throws(() => {
        textFileReader.countLines();
    });

    t.throws(() => {
        textFileReader.read(() => {});
    });

    await sleep(2000);
    t.pass();
});

test("TextFileReader: use settings", async (t) => {
    const readLines = 5;

    fs.writeFileSync(
        "./example/test.settings.json",
        JSON.stringify({ line: readLines })
    );

    const textFileReader = new TextFileReader();
    let path = "./example/test.txt";

    textFileReader.openFile(path);

    var index = 0;
    var value = "";

    await textFileReader.read((line, lineNumber) => {
        index = lineNumber;
        value = line;
        textFileReader.stop();
    });

    t.is(index, readLines + 1);
    t.is(value, "fig");
});

test("TextFileReader: count lines", async (t) => {
    const textFileReader = new TextFileReader();
    let path = "./example/test.txt";

    textFileReader.openFile(path);

    var count = await textFileReader.countLines();

    t.is(count, 235);
});

test("TextFileReader: save settings after 10 lines", async (t) => {
    const textFileReader = new TextFileReader(10);
    let path = "./example/test.txt";

    textFileReader.openFile(path);
    textFileReader.resetSettings();

    let settings = { line: 0 };

    await textFileReader.read((line, lineNumber) => {
        if (lineNumber > 25) {
            settings = JSON.parse(
                fs.readFileSync("./example/test.settings.json", "utf-8")
            );

            textFileReader.stop();
        }
    });

    t.is(settings.line, 20);
});
