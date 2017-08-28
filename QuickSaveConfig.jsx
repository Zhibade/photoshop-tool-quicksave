// ----- Quick Save Tool Config ----
//
// Parameters:
// _prefsPath = Tool preferences file path
// _prefsFile = Tool preferences file name

#target photoshop

var _prefsPath = Folder.userData + "/PhotoshopScripts";
var _prefsFile = _prefsPath + "/QuickSave.ini";

function InitUI(globalMode)
{
	var prevPrefs = LoadSettings(globalMode);
	
	var title = "";
	
	if (IsCurrentDocumentValid() == false)
	{
		globalMode = true;
	}
	else
	{
		title = "Local Mode: " + app.activeDocument.name;
	}
	
	if (globalMode)
	{
		title = "Global Mode";
	}
	
	var window = new Window("dialog", "Quick Save Config");
	
	var titleGroup = window.add("group");
	titleGroup.alignment = "center";
	var titleTex = titleGroup.add("statictext", undefined, title);
	
	var subTitleGroup = window.add("group");
	
	var oppositeMode = globalMode == false ? "Global" : "Local";
	var savingModeBtn = subTitleGroup.add("button", undefined, "Switch to " + oppositeMode);
	savingModeBtn.onClick = 
	function () 
	{ 
		window.close(); 
		
		if (globalMode == false)
		{
			InitUI(true);
		}
		else
		{
			if (IsCurrentDocumentValid())
			{
				InitUI(false);
			}
			else
			{
				alert("Please have a PSD file open and active before switching to local mode.");
				InitUI(true);
			}
		}
	}
	
	var helpBtn = subTitleGroup.add("button", undefined, "Help");
	helpBtn.onClick = function () { alert("Input the desired path, format, and saving mode. Save the settings, then run the QuickSave script.\n\nLocal saving mode only works on PSD files."); }
	
	var inputPanel = window.add("panel");
	
	var pathGroup = inputPanel.add("group");
	var path = pathGroup.add("edittext", undefined, prevPrefs[0]);
	path.characters = 30;
	var pathBrowseBtn = pathGroup.add("button", undefined, "Browse");
	pathBrowseBtn.onClick = function () { path.text = BrowseFile(); } // Callback for browse buttons
	
	var formatPrefs = 0;
	
	switch (prevPrefs[1])
	{
		case "TGA32":
			formatPrefs = 0;
			break;
		case "TGA24":
			formatPrefs = 3;
			break;
		case "PNG":
			formatPrefs = 2;
			break;
		case "TIFF":
			formatPrefs = 1;
			break;
	}
	
	var formatGroup = inputPanel.add("group");
	var dropDown = formatGroup.add("dropdownlist", undefined, ["TGA", "TIFF", "PNG"]);
	dropDown.selection = formatPrefs%3;
	dropDown.onChange = function () { alpha.enabled = UpdateUI(dropDown.selection.index); }
	var alpha = formatGroup.add("checkbox", undefined, "Alpha");
	alpha.value = formatPrefs != 3 ? true : false;
	alpha.enabled = dropDown.selection.index == 0 ? true : false;
	
	var buttonGroup = window.add("group");
	var btn1 = buttonGroup.add("button", undefined, "Save");
	var btn2 = buttonGroup.add("button", undefined, "Cancel");
	
	btn1.onClick = 
	function () 
	{ 
		SaveSettings(path.text, dropDown.selection.index, alpha.value, globalMode);
		window.close();
	}

	window.show();
}

function BrowseFile()
{
	targetFile = File.openDialog("Selection prompt");
	return targetFile.fsName; // Return OS specific path instead of URI encoding
}

function UpdateUI(index)
{
	if (index == 0)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function SaveSettings(path, format, alpha, isGlobal)
{
	var formatString = "";
	
	switch (format)
	{
		case 0:
			if (alpha)
			{
				formatString = "TGA32";
			}
			else
			{
				formatString = "TGA24";
			}
			break;
		case 1:
			formatString = "TIFF";
			break;
		case 2:
			formatString = "PNG";
			break;
	}
	
	if (isGlobal == false)
	{
		if (IsCurrentDocumentValid())
		{
			app.activeDocument.info.keywords = ["Quick Save PSD Settings", path, formatString];
			
			prefs = new File(_prefsFile);
			prefs.open("r");
			
			prefsContents = [prefs.readln(), prefs.readln(), prefs.readln(), "GlobalMode=false"]
			
			var finalContents = "";
			
			for (var i = 0; i < prefsContents.length; i++)
			{
				finalContents += prefsContents[i] + "\n";
			}
			
			prefs.open("w");
			prefs.write(finalContents);
			prefs.close();
		}
		else
		{
			alert("Can't save settings to the current file. Please open a .PSD file or save the settings globally");
		}
	}
	else
	{
		prefs = new File(_prefsFile);
		prefsFolder = new Folder(_prefsPath);
		
		if (prefsFolder.exists == false)
		{
			prefsFolder.create();
		}
		
		var contents = "Quick Save Settings:\n";
		contents = contents + "Path=" + path + "\n";
		contents = contents + "Format=" + formatString + "\n";
		contents = contents + "GlobalMode=" + isGlobal;
		
		prefs.open("w");
		prefs.write(contents);
		prefs.close();
	}
}

function LoadSettings(globalMode)
{
	prefs = new File(_prefsFile);
	
	if (prefs.exists)
	{
		prefs.open("r");
		var contents = [prefs.readln(), prefs.readln(), prefs.readln(), prefs.readln()];
		
		var filePath = "";
		var format = "";
		
		if (contents[0].indexOf("Quick Save Settings:") > -1)
		{
			isGlobal = contents[3].substring(11, contents[3].length);
			
			var activeDocuments = app.documents.length > 0 ? true : false;
			var keywordsDefined = false;
			
			if (activeDocuments)
			{
				keywordsDefined = app.activeDocument.info.keywords.length > 0 ? true : false;
			}
			
			if (globalMode == false && keywordsDefined && activeDocuments)
			{
				filePath = app.activeDocument.info.keywords[1];
				format = app.activeDocument.info.keywords[2];
				return [filePath, format, globalMode];
			}
			else
			{
				filePath = contents[1].substring(5, contents[1].length);
				format = contents[2].substring(7, contents[2].length);
				return [filePath, format, isGlobal];
			}
		}
		else
		{
			return CreateDefaultFile();
		}
	}
	else
	{
		return CreateDefaultFile();
	}
}

function CreateDefaultFile()
{
	prefs = new File(_prefsFile);
	prefsFolder = new Folder(_prefsPath);
	
	if (prefsFolder.exists == false)
	{
		prefsFolder.create();
	}
	
	var contents = "Quick Save Settings:\n";
	contents = contents + "Path=" + Folder.myDocuments.fsName + "\\Texture.tga" + "\n";
	contents = contents + "Format=TGA32\n" ;
	contents = contents + "GlobalMode=false";
	
	prefs.open("w");
	prefs.write(contents);
	prefs.close();
	
	return [Folder.myDocuments.fsName + "\\Texture.tga", "TGA32", "true"];
}

function IsCurrentDocumentValid()
{
	if (app.documents.length > 0)
	{
		if (app.activeDocument.name.toLowerCase().indexOf(".psd") > -1)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
	else
	{
		return false;
	}
}

// Main
function Main()
{
	if (IsCurrentDocumentValid())
	{
		if (app.activeDocument.info.keywords.length > 2)
		{
			if (app.activeDocument.info.keywords[0].indexOf("Quick Save") > -1)
			{
				InitUI(false);
			}
			else
			{
				InitUI(true);
			}
		}
		else
		{
			InitUI(true);
		}
	}
	else
	{
		InitUI(true);
	}
}

Main();