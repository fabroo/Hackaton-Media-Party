# Simple Media Party Chrome Extension

A minimal Chrome extension boilerplate for the Media Party hackathon. Simple, clean, and easy to understand.

## 📁 Files (Only 5 files needed!)

```
├── manifest.json      # Extension configuration
├── popup.html         # Simple popup interface
├── background.js      # Background script (minimal)
├── content.js         # Content script for page interaction
└── icon*.png          # Extension icons (4 files)
```

## 🚀 How to Test Your Extension

### Step 1: Load Extension in Chrome
1. **Open Chrome browser**
2. **Go to** `chrome://extensions/`
3. **Turn ON** "Developer mode" (top-right toggle)
4. **Click** "Load unpacked"
5. **Select** your project folder (`Hackaton-Media-Party`)
6. **Refresh** the extension if it was already loaded (reload button)

### Step 2: Test the Extension
1. **Pin the extension**: 
   - Click the puzzle piece icon (🧩) in Chrome toolbar
   - Click the pin icon next to your extension
   
2. **Go to ANY website** with paragraphs (like Wikipedia, news sites)
   - Try: https://en.wikipedia.org/wiki/Web_page
   - Or: https://www.bbc.com/news
   
3. **Click your extension icon** in the toolbar
4. **Click** "Mostrar Párrafos" button
5. **See results** with "Estos son los textos:" header

### Step 3: If Still Not Working - Debug Steps
**Check Console Errors:**
1. Right-click on extension icon → "Inspect popup" → Console tab
2. Or: Go to any webpage → F12 → Console tab
3. Look for error messages in red

**Common Issues:**
- ✅ Extension loaded? Check chrome://extensions/ page
- ✅ Extension pinned? Look for your icon in toolbar
- ✅ On a real webpage? Not chrome:// pages
- ✅ Refreshed the extension after changes? Click reload button

## 🔧 What Each File Does

- **manifest.json**: Tells Chrome about your extension (name, permissions, files)
- **popup.html**: The interface that appears when you click the extension icon
- **background.js**: Runs in background, handles basic setup
- **content.js**: Runs on web pages to analyze content
- **icon*.png**: Images for the extension icon

## ⚠️ Troubleshooting

**Extension won't load?**
- Check manifest.json has valid JSON syntax
- Make sure all files exist in the same folder

**Buttons don't work?**
- Open Developer Tools (F12) → Console tab
- Look for error messages

**No results showing?**
- Make sure you're on a regular webpage (not chrome:// pages)

## 🔗 Learn More

- [Chrome Extensions Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/)

---

**Ready to code! 🚀**