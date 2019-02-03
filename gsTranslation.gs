function getRESTfulXMLRootElement_(url) {
  var xml = UrlFetchApp.fetch(url).getContentText();
  var document = XmlService.parse(xml);
  var root = document.getRootElement();
  return root;
}

/**
 * Get Japanese dictionary defenition from Dejizo GetDictItemLite service by index number (itemID)
 *
 * Assumption - Only one <body> tag in response as well as <div> within <body>
 *
 * @return The first Japanese defenition from GetDictItemLite service
 * @customfunction
 */
function getDejizoGetDicItemLite_(itemID) {
  var url = 'http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite?Dic=EJdict&Loc=&Prof=XHTML&Item=' + itemID;
  var root = getRESTfulXMLRootElement_(url);
  var ns = XmlService.getNamespace('http://btonic.est.co.jp/NetDic/NetDicV09');
  var body = root.getChild('Body', ns);  
  var divNetDicBody = body.getChildren();
  var divContent = divNetDicBody[0].getChildren();
  var content = divContent[0].getText();
  return content;  
}

/**
 * Get index number of Dejizo Japanese dictionary by English input by EXACT match pattern
 *
 * @return Index number (itemID) of English source
 * @customfunction
 */
function searchDejizoSearchDicItemLite_(source) {
  var array = [];

  // Concatenate multiple words into single word as Dejizo takes input as compound
  source = source.replace(/\ /g,'');
  var url = 'http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite?Dic=EJdict&Scope=HEADWORD&Match=EXACT&Merge=AND&Prof=XHTML&PageSize=20&PageIndex=0&Word=' + source;
  var root = getRESTfulXMLRootElement_(url);
  var ns = XmlService.getNamespace('http://btonic.est.co.jp/NetDic/NetDicV09');

  // If 0 hitcount, exit function with null
  var totalHitCount = root.getChild('TotalHitCount', ns).getText();
  if (totalHitCount == 0) {
    return null;
  }

  var titleList = root.getChild('TitleList', ns);
  var entries = titleList.getChildren('DicItemTitle', ns);
  for (var i = 0; i < entries.length; i++) {
    var itemID = entries[i].getChild('ItemID', ns).getText();
    var content = getDejizoGetDicItemLite_(itemID);
    array.push([i+1,content]);
  }
  return array;
}

/**
 * Translate source from a language to another language. Use ISO 2 letter language code for from and to.
 * example =TRANSLATE("orange","EN","JP")
 *
 * English to Japanese: Dejizo searchDictItemLite and getDictItemLite
 *
 * @return Translation from web service defined in each language
 * @customfunction
 */
function TRANSLATE(source,from,to) {
  var array=[];
  if (source == null) {
    // return null if source is null
    return null;
  }
  switch (from) {
    case 'EN':
      switch (to) {
        case 'JP':
          // English to Japanese
          array = searchDejizoSearchDicItemLite_(source);
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
  
  return array;
}








