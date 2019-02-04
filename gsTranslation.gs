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
function getDejizoGetDicItemLite_(itemID, dicID) {
  var content = null
  var url = 'http://public.dejizo.jp/NetDicV09.asmx/GetDicItemLite?Loc=&Prof=XHTML&Item=' + itemID + '&Dic=' + dicID;
  var root = getRESTfulXMLRootElement_(url);
  var ns = XmlService.getNamespace('http://btonic.est.co.jp/NetDic/NetDicV09');
  var body = root.getChild('Body', ns);  
  var divNetDicBody = body.getChildren();
  var divContent = divNetDicBody[0].getChildren();
  var divInside = divContent[0].getChildren();
  var divInsideLen = divInside.length;
  // E to J dictionary result has <div> inside divContent and need to process these.  
  if (divInsideLen == 0) {
    content = divContent[0].getText();
  } else {
    for (var i = 0; i < divInsideLen - 1; i++) {
      if (i == 0) {
        content = divInside[i].getText();
      } else {
        content = content + " / " + divInside[i].getText();
      }
    }
  }
  return content;  
}

/**
 * Get index number of Dejizo Japanese dictionary by English input by EXACT match pattern
 *
 * @return Index number (itemID) of English source
 * @customfunction
 */
function searchDejizoSearchDicItemLite_(source, dicID) {
  var array = [];

  // Concatenate multiple words into single word as Dejizo takes input as compound
  source = source.replace(/\ /g,'');
  var url = 'http://public.dejizo.jp/NetDicV09.asmx/SearchDicItemLite?Scope=HEADWORD&Match=EXACT&Merge=AND&Prof=XHTML&PageSize=20&PageIndex=0&Word=' + source + '&Dic=' + dicID;
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
    var content = getDejizoGetDicItemLite_(itemID, dicID);
    array.push([i+1,content]);
  }
  return array;
}

/**
 * Translate word(s) FROM a language TO another language. 
 * 
 * Use ISO 2 letter language code for FROM and TO. example =TRANSLATE("orange","EN","JA").
 *
 * English to Japanese: Dejizo searchDictItemLite and getDictItemLite.
 *
 * https://github.com/takafreak/gsTranslation/
 *
 * @param source          Source word(s).
 * @param from            Source word(s) language in ISO 2 letter code (e.g. EN for English, JA for Japanese).
 * @param to              Language to translate to. Use 2 letter ISO code for language.
 *
 * @return [index,string] Translation from web service defined in each language.
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
        case 'JA':
          // English to Japanese
          array = searchDejizoSearchDicItemLite_(source, 'EJdict');
          break;
        default:
          break;
      }
      break;
    case 'JA':
      switch (to) {
        case 'EN':
          // Japanese to English
          array = searchDejizoSearchDicItemLite_(source, 'EdictJE');
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
