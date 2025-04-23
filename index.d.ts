export class TextFileReader {
    /**
     * Constructor for TextFileReader.
     *
     * @param {number} [saveSettingsEveryLine=10] - The number of lines to read before saving the current line number to a settings file.
     */
    constructor(saveSettingsEveryLine?: number);
    /**
     * Opens a file and sets the internal path if the file exists.
     *
     * @param {string} path - The path to the file to be opened.
     * @throws Will throw an error if the file does not exist.
     */
    openFile(path: string): void;
    /**
     * Returns the path of the currently opened file.
     *
     * @returns {string} - The path to the currently opened file.
     * @throws Will throw an error if no file is opened.
     */
    getPath(): string;
    /**
     * Reads the file line by line starting from a specified line number and executes a callback function for each line.
     * The reading process can be paused and resumed, and settings are saved periodically.
     *
     * @param {(line:string, lineNumber: number)=>Promise<void>|void} callback - An asynchronous function to call for each line read,
     * receiving the line content and its corresponding line number.
     * @returns {Promise<boolean>} - A promise that resolves to true when the file reading is completed successfully.
     * @throws Will log an error and reject the promise if an error occurs during file reading.
     */
    read(callback: (line: string, lineNumber: number) => Promise<void> | void): Promise<boolean>;
    /**
     * Resets the line number to 0 and saves the settings.
     *
     * This can be useful if you want to start reading from the beginning of the file again.
     */
    resetSettings(): void;
    /**
     * Stops the reading process and ends the current file stream.
     *
     * If the file is not currently being read, the function returns immediately.
     */
    stop(): void;
    countLines(): Promise<any>;
    #private;
}
//# sourceMappingURL=index.d.ts.map