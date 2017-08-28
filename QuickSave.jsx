// --- Quick Save Tool (Config in another script) ---
//
// Parameters:
// _prefsPath = Tool preferences file path
// _prefsFile = Tool preferences file name

#target photoshop

var _prefsPath = Folder.userData + "/PhotoshopScripts";
var _prefsFile = _prefsPath + "/QuickSave.ini";

function TGAOptions(alpha)
{
	var saveSettings = new TargaSaveOptions();
	saveSettings.alphaChannels = alpha;
	saveSettings.resolution = alpha ? TargaBitsPerPixels.THIRTYTWO : TargaBitsPerPixels.TWENTYFOUR;
	saveSettings.rleCompression = false;
	
	return saveSettings;
}

function PNGOptions()
{
	var saveSettings = new PNGSaveOptions();
	saveSettings.compression = 0;
	saveSettings.interlaced = false;
	
	return saveSettings;
}

function TIFFOptions()
{
	var saveSettings = new TiffSaveOptions();
	saveSettings.alphaChannels = true;
	saveSettings.layers = false;
	saveSettings.transparency = false;
	
	return saveSettings;
}

function QuickSave(path, format)
{
	if (path.lastIndexOf(".") == path.length-4)
	{
		path = path.substring(0, path.length-4); 
	}
	
	var saveOptions;
	var extension = "";
	
	switch (format)
	{
		case "TGA32":
			saveOptions = TGAOptions(true);
			extension = ".tga";
			break;
		case "TGA24":
			saveOptions = TGAOptions(false);
			extension = ".tga";
			break;
		case "PNG":
			saveOptions = PNGOptions();
			extension = ".png";
			break;
		case "TIFF":
			saveOptions = TIFFOptions();
			extension = ".tiff";
			break;
	}
	
	var newFile = new File(path + extension);
	
	if (newFile.exists)
	{
		if (newFile.readonly)
		{
			alert("Destination file is read-only. Please make sure you have the file checked out on Perforce.");
			return;
		}
	}
	
	app.activeDocument.saveAs(newFile, saveOptions, true);
	alert("Exported " + path + extension + " successfully!");
}

function LoadConfig(isGlobal)
{
	if (isGlobal)
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
				filePath = contents[1].substring(5, contents[1].length);
				format = contents[2].substring(7, contents[2].length);
				global = contents[3].substring(11, contents[3].length);
				
				return [filePath, format, global];
			}
			else
			{
				alert("Configuration file appears to be corrupted. Please run the configuration script again.");
			}
		}
		else
		{
			alert("Please run the configuration script first before running the quick save script.");
		}
	}
	else
	{
		return [app.activeDocument.info.keywords[1], app.activeDocument.info.keywords[2]];
	}
}

function Main()
{
	if (app.documents.length < 1)
	{
		alert("Please open at least 1 image file.");
		return;
	}
	
	var prefs = LoadConfig(true);
	
	if (prefs[2] == "false")
	{
		if (app.activeDocument.name.toLowerCase().indexOf(".psd") > -1)
		{
			if (app.activeDocument.info.keywords.length < 1)
			{
				alert("This PSD has no local Quick Save data stored. Please run the Quick Save Configuration script to set it, or to switch to global mode.")
				return;
			}
			else if (app.activeDocument.info.keywords[0].indexOf("Quick Save") == -1)
			{
				alert("This PSD has no local Quick Save data stored. Please run the Quick Save Configuration script to set it, or to switch to global mode.")
				return;
			}
			else
			{
				prefs = LoadConfig(false);
			}
		}
		else
		{
			prefs = LoadConfig(true);
		}
	}
	
	QuickSave(prefs[0], prefs[1])
}

Main();