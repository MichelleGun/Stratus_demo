# Stratus prototype

"Stratus, a supercomputer in your pocket." A clickable demo of a cloud computer streaming app: open it on a phone and run heavy software (code, data, 3D, games, video) on a simulated cloud machine.

**Honest prototype note.** Nothing runs in the cloud. Every machine, app and number is simulated in the browser from a fixed random seed (67), so the demo looks identical every time you film it. The apps are look-alikes, not affiliated with any software vendor. No payments, no data leaves the device.

## Apps

| App | Industry | Minimum plan | GPU | Same kind of tool as |
|---|---|---|---|---|
| VS Code | Data and AI | Standard | No | Visual Studio Code |
| Spreadsheet | Business | Standard | No | Excel |
| 3D Studio | Game and Design | Pro | Yes | Blender |
| Log Analytics | Cybersecurity | Standard | No | Splunk |
| BI Dashboard | Business | Standard | No | Power BI, Tableau |
| Game Engine | Game and Design | Pro | Yes | Unity, Unreal |
| Data Notebook | Data and AI | Standard | No | Jupyter |
| Qualitative Research Lab | Social science | Free | No | NVivo |
| Video Editor | Game and Design | Pro | Yes | Premiere Pro |
| CAD Draft | Engineering and Architecture | Standard | No | AutoCAD, Fusion |
| Architecture Studio | Engineering and Architecture | Pro | Yes | Revit, SketchUp |

Replace the sample interview in `src/data/transcript.json` with your own material.

## Run locally

    npm install
    npm run dev

`npm run build` makes one self-contained `dist/index.html` you can host anywhere. `python3 make-artifact.py out.html` turns it into the Claude Artifact page.

## Deep links

Add these to the end of the link to jump straight to a screen. The `film-` prefix is only a naming convention, so it is kept to avoid breaking saved links.

| Link ending | Opens |
|---|---|
| `#film-splash` | Logo and tagline on dark, for the phone held up at the end |
| `#film-icon` | Grey desktop with one glowing Stratus icon. Tap it to launch into the spreadsheet |
| `#film-onboarding` | "What do you study or work in?" with the industry chips |
| `#film-prototype` | Happy path from Home: Launch, Help me pick, limit ($2), session at 60x, limit reached, welcome back |
| `#film-montage` | One session cycling Log Analytics, BI, Qualitative Lab, Notebook, Game Engine, 3.5 s each, with lower thirds |
| `#film-cohort` | Teams launch grid filling up |
| `#film-hourbank` | Hour Bank with the counter ticking |
| `#film-library` | Software Library with industry chips |
| `#film-app-<id>` | One app maximised with the HUD. Ids: `vscode`, `spreadsheet`, `studio3d`, `logs`, `bi`, `game`, `notebook`, `qualitative`, `video`, `cad`, `arch` |

## Director panel

Press **Shift + D** on a keyboard, or tap the Stratus logo **5 times** on a phone. It switches industry, opens any app, sets time speed (1x, 10x, 60x), triggers limit reached, jumps to welcome back, replays the launch sequence, toggles HUD, sound, low bandwidth and clean mode, and resets the demo.
