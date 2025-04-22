// @ts-check

import fs from "node:fs";
import es from "event-stream";

export class TextFileReader {
    /** @type {string} */
    #path;

    /** @type {{line: number}} */
    #settings;

    /** @type {string} */
    #settingsPath = "";

    /** @type {number} */
    #saveSettingsEveryLine;

    /** @type {boolean} */
    #isOpened = false;

    /** @type {boolean} */
    #isReading = false;

    /** @type {es.MapStream} */
    #stream;

    /**
     * Constructor for TextFileReader.
     *
     * @param {number} [saveSettingsEveryLine=10] - The number of lines to read before saving the current line number to a settings file.
     */
    constructor(saveSettingsEveryLine = 10) {
        this.#saveSettingsEveryLine = saveSettingsEveryLine;
    }

    /**
     * Opens a file and sets the internal path if the file exists.
     *
     * @param {string} path - The path to the file to be opened.
     * @throws Will throw an error if the file does not exist.
     */
    openFile(path) {
        if (this.#isOpened) {
            throw new Error("File already opened");
        }

        if (!fs.existsSync(path)) {
            throw new Error("File does not exist");
        }

        this.#path = path;
        this.#settingsPath =
            this.#path.split(".").slice(0, -1).join(".") + ".settings.json";
        this.#isOpened = true;
    }

    /**
     * The path to the currently opened file.
     *
     * @type {string}
     * @readonly
     */
    get path() {
        if (!this.#isOpened) {
            throw new Error("File not opened");
        }
        return this.#path;
    }

    /**
     * Reads the file line by line starting from a specified line number and executes a callback function for each line.
     * The reading process can be paused and resumed, and settings are saved periodically.
     *
     * @param {(line:string, lineNumber: number)=>Promise<void>|void} callback - An asynchronous function to call for each line read,
     * receiving the line content and its corresponding line number.
     * @returns {Promise<boolean>} - A promise that resolves to true when the file reading is completed successfully.
     * @throws Will log an error and reject the promise if an error occurs during file reading.
     */
    read(callback) {
        if (!this.#isOpened) {
            throw new Error("File not opened");
        }
        this.#settings = this.#loadSettings();

        var lineNumber = 0;
        const start_line_number = this.#settings.line;
        this.#isReading = true;

        var file_name = this.#path;

        var that = this;

        return new Promise((resolve, reject) => {
            that.#stream = fs
                .createReadStream(file_name)
                // @ts-ignore
                .pipe(es.split())
                // @ts-ignore
                .pipe(
                    es
                        .mapSync(async function (line) {
                            // pause the readstream
                            that.#stream.pause();

                            if (lineNumber < start_line_number) {
                                lineNumber += 1;
                                that.#stream.resume();
                                return;
                            }

                            await callback(line, lineNumber + 1);

                            lineNumber += 1;
                            that.#settings.line = lineNumber;

                            if (
                                lineNumber % that.#saveSettingsEveryLine ===
                                0
                            ) {
                                that.#saveSettings();
                            }

                            that.#stream.resume();
                        })
                        .on("error", function (err) {
                            that.#saveSettings();
                            that.#isReading = false;
                            console.error("\nError while reading file.", err);
                            reject(err);
                        })
                        .on("end", function () {
                            that.#saveSettings();
                            that.#isReading = false;
                            resolve(true);
                        })
                        .on("close", function () {
                            that.#saveSettings();
                            that.#isReading = false;
                            resolve(true);
                        })
                );
        });
    }

    #loadSettings() {
        let settings = {
            line: 0,
        };

        if (fs.existsSync(this.#settingsPath)) {
            settings = JSON.parse(fs.readFileSync(this.#settingsPath, "utf-8"));
        }

        this.#settings = settings;
        return settings;
    }

    #saveSettings() {
        fs.writeFileSync(this.#settingsPath, JSON.stringify(this.#settings));
    }

    /**
     * Resets the line number to 0 and saves the settings.
     *
     * This can be useful if you want to start reading from the beginning of the file again.
     */
    resetSettings() {
        if (!this.#isOpened) {
            throw new Error("File not opened");
        }

        if (this.#isReading) {
            throw new Error("Cannot reset settings while reading");
        }

        this.#settings = {
            line: 0,
        };
        this.#saveSettings();
    }

    /**
     * Stops the reading process and ends the current file stream.
     *
     * If the file is not currently being read, the function returns immediately.
     */
    stop() {
        if (!this.#isReading) return;
        this.#stream.end();
    }
}
