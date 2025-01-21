const fs = require('fs');
const path = require('path');
const readline = require('readline');
const beautify = require('js-beautify');  // Use js-beautify for beautification

// Create an interface for reading inputs from the command line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Editable regex patterns for name, type, members, version, and xml declaration
const regexPatterns = {
  xmlDeclaration: /<\?xml[^>]*\?>/g,  // Regex to match XML declaration
  Package: /<[^>]*Package[^>]*>/g, // Regex to match <Package> elements
  type: /<[^>]*type[^>]*>/g,  // Regex to match <*/*type> elements
  members: /<[^>]*members[^>]*>/g, // Regex to match <*/*members> elements
  name: /<[^>]*name[^>]*>/g,  // Regex to match <*/*name> elements
  version: /<version>.*?<\/version>/g, // Regex to match <version> elements
};

// Function to handle file processing
function processFile(folderPath, fileName) {
  const filePath = path.join(folderPath, fileName);
  const outputFilePath = 'componentsImpacted.txt';

  // Check if the file exists
  fs.exists(filePath, (exists) => {
    if (!exists) {
      // If the file doesn't exist, write to componentsImpacted.txt
      const errorMessage = "FILE NOT FOUND, Couldn't retrieve components";
      
      // Check if componentsImpacted.txt exists
      if (fs.existsSync(outputFilePath)) {
        console.log('Old package overwritten was: componentsImpacted.txt');
      }
      
      // Create or overwrite componentsImpacted.txt with the error message
      fs.writeFileSync(outputFilePath, errorMessage, 'utf8');
      console.log(errorMessage);
      return;
    }

    // If file exists, read the content
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error("Error reading the file:", err);
        return;
      }

      // Apply regex patterns to remove elements based on regexPatterns
      let modifiedData = data;
      
      // Iterate over the regex patterns and apply each one to the data
      for (let key in regexPatterns) {
        if (regexPatterns.hasOwnProperty(key)) {
          modifiedData = modifiedData.replace(regexPatterns[key], '');  // Remove the matched elements
        }
      }

      // beautify/indent the modified data to make it properly formatted XML
      modifiedData = beautify(modifiedData, { indent_size: 2, space_in_empty_paren: true });

      // Check if componentsImpacted.txt exists
      if (fs.existsSync(outputFilePath)) {
        console.log('Old package overwritten was: componentsImpacted.txt');
      }
      
      // Create or overwrite componentsImpacted.txt with the properly indented content
      fs.writeFileSync(outputFilePath, modifiedData, 'utf8');
      console.log('Modified content has been written to componentsImpacted.txt');
    });
  });
}

// Prompt for folder path
rl.question('Enter the folder path: ', (folderPath) => {
  // Prompt for file name
  rl.question('Enter the file name: ', (fileName) => {
    // Trim whitespace from user inputs
    folderPath = folderPath.trim();
    fileName = fileName.trim();

    // Normalize folder path (handle cases where user inputs path with/without trailing slash)
    folderPath = path.normalize(folderPath);

    // Change working directory to the folder path
    try {
      process.chdir(folderPath);
      console.log(`Changed directory to ${folderPath}`);
    } catch (err) {
      console.error('Error changing directory:', err);
      rl.close();
      return;
    }

    // Process the file
    processFile(folderPath, fileName);
    rl.close();
  });
});
