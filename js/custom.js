function helloWorld(){
    console.log("Hello World!");
}


function getXmlData(){
    return document.getElementById('xml_editor').value;
}

function getCsvData(){
    return document.getElementById('csv_editor').value;
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    console.log(e)

    if(e.target.id==='file-input_xml'){
        reader.onload = function(e) {
            var contents = e.target.result;
            document.getElementById('xml_editor').value = contents;
            convert_to_csv();
        };
    }
    if(e.target.id=='file-input_csv'){
        uploaded_csv_filename = document.getElementById(e.target.id).value;
        reader.onload = function(e) {
            var contents = e.target.result;
            document.getElementById('csv_editor').value = contents;
            convert_csv_to_xml();
        };
    }
    reader.readAsText(file);
}

function convert_to_csv(){
    var text = document.getElementById('xml_editor').value;
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(text, "text/xml");

    var out, contacts, contact, person, telephony, telefone_numbers, telefone_numbers_type, telefone_numbers_prio, phone;
    out = '';
    var contacts = xmlDoc.getElementsByTagName("contact");
    for(i=0;i<contacts.length;i++) {
        contact = contacts[i];
        person = contact.getElementsByTagName("person")[0].getElementsByTagName("realName")[0].firstChild.nodeValue;
        telephony = contact.getElementsByTagName("telephony")[0].getElementsByTagName("number");
        out += '"'+person.replace('"','\\"')+'"';
        for(j=0;j<telephony.length;j++){
            phone = telephony[j].firstChild.nodeValue;
            out += ", "+ '"'+phone.replace('"','\\"')+'"';;
        }
        out += "\n";
    }
    document.getElementById('csv_editor').value = out;

    return out;
}

function convert_csv_to_xml(){
    var text = document.getElementById('csv_editor').value;
    var out = ''; var person;
    out += '<?xml version="1.0" encoding="utf-8"?>\n<phonebooks>\n<phonebook>\n';
    var contacts = CSVToArray(text);
    for(i=0;i<contacts.length;i++) {
        if(contacts[i]=='')continue;
        out += '<contact>\n<category>0</category>\n';
        var elements = contacts[i];
        person = elements[0].substring(0);
        person = person.replace(/^\s+|\s+$/gm,''); //trim spaces
        person = person.replace(/^"+|"+$/gm,''); //trim "
        out += '<person><realName>'+person+'</realName></person>\n';
        out += '<telephony nid="'+i+'">\n';
        for(j=1;j<elements.length;j++){
            var phone = elements[j];
            if(j==elements.length-1)phone = phone.substring(0,phone.length);
            phone = phone.replace(/^\s+|\s+$/gm,''); //trim spaces
            phone = phone.replace(/^"+|"+$/gm,''); //trim "
            out += '<number type="home">'+phone+'</number>\n';
        }
        out += '</telephony>\n<services /><setup />\n<features doorphone="0" /><mod_time></mod_time><uniqueid></uniqueid>\n</contact>\n';
    }
    out += '</phonebook>\n</phonebooks>';
    document.getElementById('xml_editor').value = out;

    return out;
}

// reference: https://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.html
// reference: http://stackoverflow.com/a/1293163/2343
function CSVToArray( strData, strDelimiter ){
    strDelimiter = (strDelimiter || ",");
    var objPattern = new RegExp(
        (
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            "([^\\" + strDelimiter + "\\r\\n]*))"
        ),"gi");

    var arrData = [[]];
    var arrMatches = null;

    while (arrMatches = objPattern.exec( strData )){
        var strMatchedDelimiter = arrMatches[ 1 ];
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ){
            arrData.push( [] );
        }
        var strMatchedValue;
        if (arrMatches[ 2 ]){
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );
        } else {
            strMatchedValue = arrMatches[ 3 ];

        }
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }
    return( arrData );
}

function download(type) {
    var text = null;
    switch (type) {
        case 'csv':
            text = getCsvData();
            break;
        case 'xml':
            text = getXmlData();
            break;
    }

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', "filename."+type);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}