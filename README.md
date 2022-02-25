# WaniKani Undo
### Unofficial Browser Extension

This is an unofficial extension for the browser to undo wrong answers when doing reviews at [WaniKani.com](https://www.wanikani.com/).

#### VERSION 0.1.0

## Table of contents:
1. [Latest Features](#changelog-v011)
2. [Usage Guide](#usage-guide)
	* 2.1 [Undo Answer](#undo-answer)
	* 2.2 [Disable Extension](#disable-extension)
	* 2.3 [Shortcut Keys](#shortcut-keys)
	* 2.4 [Settings](#settings)
3. [Pictures](#pictures)

## Changelog v0.1.1

### Content
- Fixed bugs when transforming user input into kana during reviews

## Changelog v0.1.0
Released on 17/09/21

### Content
- Button to undo mistake
- Button to enable/disable extension in real time
- Implemented some shortcut keys:
	- **U:** Undo a mistake
	- **X:** Disable/enable extension in real time
	- **Esc:** Remove cursor from answer input and stop typing
	- **Enter:** Put cursor back into answer input (only if answer input is empty)

### Popup
- Setup of some settings and hotkeys

#### [(All changelogs)](CHANGELOG.md)

## Usage Guide
### Undo Answer:
When doing a session of reviews in Wanikani, if you get an answer wrong, either meaning or reading, you have the possibility to, right away, go back with your answer, before it is actually submited, and rectify it.

To undo an answer you can either click the button with the undo symbol, or use a shortcut key (default is 'U').

You can only undo an answer the first time you send it. In this stage of just one send click, if the answer is wrong, it is not yet submited to WaniKani servers. If you send it again, without undoing it, then it will behave as a normal wrong answer.

Answer information will only be available to you after you confirm that you want to send it, either correct of incorrect. (If you can still undo an answer, then you won't have access to the subject information)

The point of this system is to prevent "damaging" the SRS in case you make a silly typo that is not covered by WaniKani's answer checking system.

This system can, obviously, be exploited in ways that will harm your learning. If you use it to rectify an answer you weren't sure, then you will complete that subject successfully and advance an SRS stage, even though you weren't fully ready for it.

Correct answers cannot be undone.

### Disable Extension:
You can disable this extension in real time, meaning, if you decide you don't want to be able to undo your answers, even if in the middle of a review session, you either click the extension icon, within the page, in the top right corner, or use a shortcut key (default is 'X')

The same thing goes for enabling it.

### Shortcut Keys:
There a few shortcut keys that allow you to interact with some features through your keyboard. The default shortcuts are:
- **U**: Undo a wrong answer   
- **X**: Disable/enable extension in real time
- **Esc**: Remove cursor from answer input and stop typing
- **Enter**: Put cursor back into answer input (only if answer input is empty)

### Settings:
The extension popup has a few settings that can be managed.
- **Review Session Interface**
	- **Auto Show Item Info:** open item info immediatly after an answer is confirmed as correct or incorrect
	- **Distinguish Answer Input:** add a decorative line to the left side of the answer input to indicate that the extension is active
- **Hotkeys**
	- (Change any shortcut key you want)

## Pictures
![pic1](images/picture1.jpg)
![pic2](images/picture2.jpg)