# gsTranslation
Translation custom function for Google Sheets

# Setup
1. Open your Google Sheets
2. Tools > Script Editor
3. Paste gsTranslation.gs in this github project and save it on your project. You can save in any project name or script name.
4. Back to your Google Sheets
5. In the cell you want to show translation, add following function.
```
=TRANSLATE(source,from,to)
```
For example, if you have input word(s) in A2 cell and it is translation from English (EN) to Japanese (JA), add function as follows.
```
=TRANSLATE(A1,"EN","JA")
```
6. Translation result is shown on the cell.

# Screen shot
![Usage](https://raw.githubusercontent.com/takafreak/gsTranslation/master/Custom%20Functions%20in%20Google%20Sheets%20-%20Translate.png "Usage")

# Service
* Dejizo REST Web Service API - https://www.est.co.jp/dev/dict/REST (Japanese only)

# History
## Feb 4, 2019
* English to Japanese, Japanese to English translation supported utilizing Dejizo REST Web Service API
