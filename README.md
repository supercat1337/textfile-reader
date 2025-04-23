# Textfile Reader

The `TextFileReader` is a utility for reading large text files line by line. It saves the state of the last read line number in a file, allowing it to resume reading from the same position in case of an error.

**Usage**

```js
const textFileReader = new TextFileReader();

// Open a file
textFileReader.openFile("./large_file.txt");

// Reset the settings if you want to start reading from the beginning
// textFileReader.resetSettings();

// Start reading from the line that was saved in the settings
await textFileReader.read((line, lineNumber) => {
    console.log(lineNumber, ":", line);
    // Stop the reading process
    textFileReader.stop();
});
```

**TextFileReader Class**

**Methods**

-   `constructor(saveSettingsEveryLine = 10)`: Initializes the class with an optional parameter to set the frequency of saving settings.
-   `openFile(path)`: Opens a file at the specified path and sets the internal path if the file exists. Throws an error if the file does not exist or is already opened.
-   `read(callback)`: Reads the file line by line from the saved line number, executes the provided callback function for each line, and saves the line number periodically. Returns a promise that resolves to true when the file reading is completed successfully. The callback may be asynchronous or synchronous.
-   `resetSettings()`: Resets the line number to 0 and saves the settings. Throws an error if no file is opened.
-   `stop()`: Stops the reading process and ends the current file stream.
-   `getPath()`: Returns the path of the currently opened file. Throws an error if no file is opened.

**Note**: The `TextFileReader` class uses the Node.js `fs` module to read files, so it requires Node.js to be installed.
