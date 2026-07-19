The Attention Tollbooth

This is a  Chrome extension that turns tab-m hoarding into a game. Every new tab must "pay a toll" and then a chosen amount of minutes of your attention before it opens. When the timer runs out the page dims and gently nags you to close it or bribe the tollbooth for five more minutes). We should Close a tab before its timer expires and we can earn Focus Points. Let it expire and rack up Procrastination Tax.
Without blocking, shaming. It is Just a soft, mindful pause between you and your 47th tab.

---

Features
They are given below

a.The Tollgate : a  new tab greets you with a floating, glass-morphism toll window. We should Pick 1–60 minutes on a custom slider and click Pay Toll & press enter . Then the  page behind it is dimmed and blurred while we decide* 10-second decision countdown : It is a  subtle progress bar that counts down while you decide. When we Ignore it and a default 5-minute toll is applied automatically.

b.Live timers : Every  tab we have  paid for has its own timer running in the background. This is the function of live timers 

c.Expiration ritual : It wroks when the timer hits zero the page fades to grayscale over 1.5s and a pink pulsing border wraps the viewport, and a small toast offers to Evict Tab or Bribe +5m.

d.Focus Points & Procrastination Tax : This is a scoring system that rewards early tab closure and taxes procrastination. and then Streaks count consecutive days at 50+ points.

e.Dashboard popup : when we click the toolbar icon to see our  score, current streak and every tab currently on the clock with per-tab progress bars and a one-click close it ..

---

How it works

1.manifest.json :: Manifest V3 requests tabs, storage, alarms, and scripting.

2.background.js : It is a service worker that owns all state such as per-tab timers via chrome.alarms, focus points and tax counters in chrome.storage.local and badge updates.

3.content.js : It is injected into every http/https page. Which Renders the tollgate UI, the expiration overlay and the toast all inside a closed Shadow DOM so host page CSS can't leak in. 

4.popup.html / popup.css / popup.js : It is the toolbar  dashboard.

5.icons/ -16 / 48 / 128 px extension icons.

All the UI in this project is vanilla JS+ CSS and no external libraries are used

---

Scoring rules
These are the scoring rules 

Action	                                Change
Close a tab before its timer expires:	It will change +10 FP
Close within the first 10% of allocated time:	It will change +5 FP bonus
Bribe the tollbooth (+5m) after expiration:	 It will change +2 FP and +1 Tax
Let a tab expire	:It will change +1 Tax:
Earn 50 FP in a day	   then Streak day will be count

If we miss a day streak will be reset

---

Edge cases
These are the cases: 
a.Session restore after crash : When the timers do not persist across browser it restarts by design and a new tabs from a restored session are treated as new and offered a fresh toll.
b.Rapid opens : it works by letting each new tab gets its own independent toll window and they do not stack.
c.Non-http pages : here the content script is a no-op on chrome://, extension pages, and the new tab page also itself . Tolls are  only apply to real web pages.

License

Bishow Gyawali
