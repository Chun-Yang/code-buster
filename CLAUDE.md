## Screen 1: main/default screen to show morse code fluency and start an exercise
- Need a way to show 26 Chars and their Morse code
    - For each char, we need to show the
        - char
        - svg (TODO download)
        - morse code
        - fluency rate (in background color)
            - no color -> has not started yet
            - yellow -> >= 60% accuracy
            - green -> >= 80% accuracy
- Need a button to start exercise (for encode)

## Screen 2: exercise configeration screen
- Select encode or decode (default to decode)
- Select word or letter (default to letter if average fluency rate is < 80%)
- A button to start at the top

## Screen 3: exercise screen
- Dependig on whether it's encode and decode, show it in the title at top
- We could show a word or a letter depending on 
    - If we show a letter, the lower the fluency rate, the higher chance of the letter should show up.
- If it's encode, show english and let user type in morse code
- If it's decode, show morse code and let user type in english
- If it's a encode screen, show ".", "-" and " " space as clickable areas at the bottom, the 3 areas should split up the whole width of the screen, height should be 10rem

