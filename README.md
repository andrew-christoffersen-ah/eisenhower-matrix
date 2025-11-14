# Eisenhower Matrix Web Application

A simple, local web-based Eisenhower Matrix application for organizing daily tasks into four categories based on urgency and importance. Features daily inspirational quotes with random fun styling.

## Features

- **Task Management**: Add tasks to any of the four quadrants with clickable URLs
- **Task Completion**: Mark tasks complete with celebratory confetti animation
- **Done This Month**: Track completed tasks with dates at the bottom of the page
- **Auto-Copy Tasks**: Button to copy tasks from most recent day with tasks (within 7 days)
- **Date Navigation**: Browse back and forward through dates
- **Daily Quotes**: Random inspirational quotes with fun colors and fonts each day
- **Copy/Paste Matrices**: Copy a complete matrix from one day and paste it to another
- **Drag & Drop**: Move tasks between quadrants by dragging and dropping
- **Data Persistence**: Automatic saving using cookies and localStorage
- **Export/Import**: Save your data as JSON files for backup and sharing
- **Responsive Design**: Works on desktop and mobile devices

## Eisenhower Matrix Quadrants

1. **Do Now** (Urgent & Important) - Red quadrant
   - Tasks that need immediate attention

2. **Schedule** (Important but Not Urgent) - Green quadrant
   - Tasks to plan and schedule for later

3. **Delegate** (Urgent but Not Important) - Orange quadrant
   - Tasks that can be handed off to others

4. **Eliminate** (Neither Urgent nor Important) - Gray quadrant
   - Tasks that should be eliminated or minimized

## How to Use

1. **Start the Application**:
   ```bash
   python3 -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

2. **Add Tasks**:
   - Enter a task in the input field
   - Select the appropriate quadrant
   - URLs in task text automatically become clickable links
   - Click "Add Task" or press Enter

3. **Complete Tasks with Celebration**:
   - Click the green ✓ to mark tasks as completed with confetti animation
   - Completed tasks are moved to "Done This Month" section at the bottom
   - Click the red × to delete tasks permanently without celebration

4. **Move Tasks Between Quadrants**:
   - Click and drag any task to move it to a different quadrant
   - Drop zones will highlight when you hover over them
   - Tasks automatically save when moved

5. **Navigate Dates**:
   - Use "Previous Day" and "Next Day" buttons
   - The current date is always displayed

6. **Copy/Paste Matrices**:
   - Click "Copy Today's Matrix" to copy all tasks
   - Navigate to another date
   - Click "Paste Matrix to Today" to apply the copied tasks

7. **Auto-Copy Tasks**:
   - Click "Auto-Copy Previous Tasks" to populate current day with recent unfinished tasks
   - Copies from the most recent day with tasks (within last 7 days)

8. **Backup Your Data**:
   - Click "Export Data as JSON" to download your data
   - Click "Import Data from JSON" to restore from a backup

## Done This Month

Keep track of your accomplishments with the monthly completion tracker:

- **Automatic Tracking**: Completed tasks appear in "Done This Month" at the bottom of the page
- **Month-Based**: Only shows tasks completed since the 1st of the current month
- **Date Stamped**: Each task shows the date it was completed
- **Column Layout**: Clean, organized list sorted by most recent first
- **Auto-Cleanup**: Tasks from previous months are automatically removed
- **Persistent**: All completed tasks save automatically

## Daily Quotes

- **Random Selection**: Each day features a different quote from `quotes.json`
- **Consistent Styling**: The same quote and styling appear for the same date
- **Fun Variety**: 15 different color schemes and font combinations
- **Customizable**: Edit `quotes.json` to add your own inspirational quotes

## Automatic Saving

Your Eisenhower Matrix data is automatically saved in multiple ways:

- **Cookies**: Primary automatic saving - data persists across browser sessions and survives browser restarts
- **localStorage**: Backup storage for immediate persistence during your session
- **Optional File Saving**: Manual file export/import for long-term archival

**Cookie Benefits:**
- Survives browser restarts and computer reboots
- Data persists even if you clear localStorage
- Expires after 1 year automatically
- No manual saving required - everything saves instantly

## Auto-Copy Tasks

Quickly populate your matrix with unfinished tasks from recent days:

- **Manual Button**: Click "Auto-Copy Previous Tasks" to copy from the most recent day with tasks
- **7-Day Window**: Searches backwards up to 7 days for tasks to copy
- **Smart Detection**: Only copies if the current day is empty and a source day is found
- **Visual Feedback**: Shows success/failure messages and notifications
- **Safety Check**: Won't overwrite existing tasks on the current day

**How it works:**
1. Click the blue "Auto-Copy Previous Tasks" button
2. The system searches the last 7 days for the most recent day with tasks
3. If found, all tasks are copied to the current day
4. A notification shows which day the tasks came from
5. If no tasks found in 7 days, shows a message to add tasks manually

## Data Storage

- **Automatic Cookie Saving**: Data persists across browser sessions using cookies
- **Fallback localStorage**: Additional backup storage in browser localStorage
- **Optional File Saving**: JSON file on your local filesystem (requires Chromium-based browser)
- **Manual Export/Import**: JSON files with date-based structure
- **File Structure**:
  ```json
  {
    "2025-10-28": {
      "do-now": ["task1", "task2"],
      "schedule": ["task3"],
      "delegate": ["task4"],
      "eliminate": ["task5"]
    }
  }
  ```

## Automatic File Saving

**Requirements**: Chromium-based browser (Chrome, Edge, Opera, etc.)

1. Click "Enable Automatic File Saving" in the Data section
2. Choose where to save the `eisenhower-matrix-data.json` file
3. Grant file access permission when prompted
4. All changes will now automatically save to this JSON file

**Note**: File access permission needs to be re-granted each browser session for security reasons.

## Technologies Used

- HTML5
- CSS3 (Responsive design)
- Vanilla JavaScript (ES6+)
- Local Storage API
- File API (for export/import)

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript features
- Local Storage API
- File API
- CSS Grid and Flexbox

## Local Development

To run locally:
```bash
cd /path/to/eisenhower-matrix
python3 -m http.server 8000
```

Or use any other local server solution.

## License

This is a simple personal productivity tool. Feel free to modify and use as needed.
