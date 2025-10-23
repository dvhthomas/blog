---
title: "Capturing edit events in ArcMap"
date: 2008-10-24T20:11:30-07:00
abstract: "The difference between saving and edit and stopping the edit process is not immediately clear in ArcMap"
toc: true
tags: [esri, dotnet, geospatial]
draft: false
---
## Issue

You are trying to capture the Save Edits and Stop Editing toolbar actions in [ArcMap](http://www.esri.com/arcgis) through code so that different actions can be performed for each event. Unfortunately the underlying events associated with the actions (saving and stopping editing) fire for both actions so figuring out if the use Saved or Stopped Editing is a chore.

## Resolution

Set up your code to listen for the events:

{{< highlight csharp >}}
private IEditEvents_Event _editEvents;
private IEditEvents2_Event _editEvents2;...

/// <summary>
/// Wire up the extension to editing events.
/// </summary>
/// <param name="editor">The current editor</param>
private void AttachEditingEvents(IEditor2 editor)
{
 if (editor != null)
 {
 _editEvents = editor as IEditEvents_Event;
 _editEvents.OnStartEditing += OnStartEditing;
 _editEvents.OnStopEditing += OnStopEditing;
 _editEvents2 = editor as IEditEvents2_Event;
 _editEvents2.OnSaveEdits += OnSaveEdits;
 }
}
{{</ highlight >}}

Then put in whatever code you need to run on the Save Edits action. In this case there is no special code apart from the magic part where a boolean field is being set to true. This basically lets the application know that “I just did a save action”.

{{< highlight csharp >}}
private bool _isSavedAction;...

/// <summary>
/// Only handle this so that a field can be set. This is to avoid
/// the issue where ArcMap fires OnSaveEdits AND OnStopEditing events
/// when the user clicks the Save Edits button. The boolean value
/// is set back to false when the OnStopEditing event is called.
/// </summary>
private void OnSaveEdits()
{
 _isSavedAction = true;
}
{{</ highlight >}}

With that field set to true, when the OnStopEditing event fires just afterwards, we can look at that field to see whether or not a Save just ran as well:

{{< highlight csharp "hl_lines=12">}}
/// <summary>
/// Clean up the workflow environment. The Workflow Manager is listening
/// for changes in this property and will perform all the necessary
/// activities to reset the editing environment.
/// </summary>
private void OnStopEditing(bool saveChanges)
{
 if (!_isSavedAction)
 {
 ActiveWorkflow = null;
 }
 _isSavedAction = false;
}
{{</ highlight >}}

Note that we are __always__ setting the `_isSavedAction` field to false after any special code has run, and our special code only runs if the field is already false in the first place.

## The Trick

Turns out this approach works very well, but it does not capture edit events caused by background edits. By background edit I means something done in a cursor behind the scenes while an edit session is active, e.g., doing a little update cursor action in your own code while a regular ArcMap edit session is in progress. This is documented by ESRI but took me a while to figure out. Fortunately the answer is simple: force these kind of background, cursor driven events to fire like all the others:

{{< highlight csharp "linenos=true, hl_lines=4">}}
IWorkspaceEditControl editControl = _mapHelper
 .Editor()
 .EditWorkspace as IWorkspaceEditControl;
editControl.SetStoreEventsRequired();
{{</ highlight >}}