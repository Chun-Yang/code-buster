## Description
This is a web app to help kids to learn encoding and decoding written morse code.
This is a mobile first app. If the screen width is too large, we limit it to 64rem.
Don't use fixed position in css.

## Tech stack
- react
- router: wouter with hash based routing
- typescript
- no server, no login, a pure client app

## Screen 1: main/default screen to show morse code fluency and start an exercise
- path "/morse", "/" redirects to "/morse"
- Need a way to show 26 Chars and their Morse code
    - For each char, we need to show a cell that contains the following info:
        - char (e.g. A)
        - png, each char has a corresponding png in public/morse that starts with it.
        - The image name without the suffix.
- Need a button to start exercise, when clicked "exercise configeration screen" will show.
- Need a button to show fluency score. When the user clicks the button, navigate to /morse-rate

## Screen 2: exercise configeration screen
- path "/morse-config"
- Select encode or decode (default to decode)
- Select word or letter (default to letter)
- A button to start at the top
    - When the user selects this button, the user will be redirected to "/morse-exercise" with the following query params
        - direction "encode" or "decode"
        - unit "word" or "letter"
- A button to go back at top left
- Remember the settings in local storage and use it to set the initial value

## Screen 3: exercise screen
- path "/morse-exercise"
- parse query params and select the "direction" (encode or decode) and "unit" (word or letter)
- At the top, show the exercise type, one of:
    - encode letter
    - encode word
    - decode letter
    - decode word
- In bellow, unit is either letter or word depending on which user selected before
- There are two fluencyRate, EncodeFluencyRate and DecodeFluencyRate, each used by corresponding type of exercise.
- Prepare some (count stored in EXERCISE_SIZE) non-repeat units and let user provide their answer.
  Show one unit at a time.
    - If there are letters whose fluencyRate is null, pick them first
    - Then rank the rest with fluencyRate, pick the lower ones first
- When the user submit, either
    - show success and move to the next unit or
    - show error and show the right answer with the PNG/PNGs.
    - For each letter that the user get right or wrong re-calcuate the fluency with exponential decay
        - right
            - if rate is null, then the fluency rate is 0.9
            - Otherwise r = r * 0.9 + 0.1
        - wrong
            - if rate is null, then the fluency rate is 0.1
            - Otherwise r = r * 0.9
- We could show a word or a letter depending on
    - If we show a letter, the lower the fluency rate, the higher chance of the letter should show up.
- If it's encode, show english and let user type in morse code
- If it's decode, show morse code and let user type in english
- If it's a encode screen, show ".", "-" and " " space as clickable huge buttons at the bottom, the 3 areas should split up the whole width of the screen.
- About the input:
    - For "decode", show the same amount of inputs, each input corresponds to a morse code. When a user type in a letter, jump to the next letter. If a user click into a input, change the existing letter as placeholder and allow user to override. After override, the cursor should jump to the next empty input. Show a red border when a input is incorrect. When all inputs are provided correctly, move to the next exercise directly. auto focus on the first letter. Allow delete for input too.
    - For "encode", also use a input for each morse code similar to "decode"
- Provide a help button. On click, show morse code cell in MorseHome for the most relevant letter. The most relevant letter is either the current select input or the first empty input. After the user provides any input, close the help section.
    - Do not change the help cell content until the user clicks help again.
    - When help cell is shown, change the “Help” button to “Hide Help”
- For each input, we consider the answer is wrong when it type in the wrong input or clicked help.

## Screen 4: Fluency Score Screen
- Add a title and some description
- Add a back button to morse home
- Use two columns to show two scores for encode and decode.
    - For the encode column, show letter and score (from A to Z)
    - For the decode column, show morse code and score (form A to Z)
    - If the rate is null, dont show a number, otherwise show a digit to round to 2 digits after decimal points
- Have a button to reset score and have a pop up for user to confirm.
- Fluency score has background with rounded border.
    - Score >= 0.9 Green
    - Score >= 0.6 and < 0.9 Yellow
    - Score < 0.6 Red
