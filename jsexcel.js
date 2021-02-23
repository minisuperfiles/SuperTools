//jsexcel v0.1
//minisuperfiles
//jagadeesan
class Jsexcel {
    constructor(settings = {}) {
        //loadData
        if (typeof this.data == 'object') {
            if (typeof settings.columns == 'object') {
                this.loadData(settings.data, settings.columns, settings.colHead);
            } else {
                this.loadData(settings.data);
            }
        }
        this.filename = (settings.filename) ? settings.filename : "jsexcel.xls";
        this.applictionType = (settings.applictionType) ? settings.applictionType : 'application/vnd.ms-excel;charset=utf-8';
        this.headStyles = (settings.headStyles) ? settings.headStyles : {};
        //callback
        this.callback = {};
        if (settings.beforeCellCreation == 'function') {
            this.callback.beforeCellCreation = settings.beforeCellCreate;
        }
        if (settings.afterCellCreation == 'function') {
            this.callback.afterCellCreation = settings.afterCellCreate;
        }
        this.officeColors = ['#c0c0c0', '#ff0000'];
        if (settings.headerProperties) {
            this.headerProperties = settings.headerProperties;
        }
        this.defultHeaderProperties = { bold: true, border: 1, halign: "center" };
        this.borders = settings.borders;
        
    }
    loadData(data = [], columns = [], colHead = false) {
        this.data = data;
        if (columns && columns.length == 0) {
            this.columns = this.getDefaultColumns();
        } else {
            this.columns = columns;
        }
        if (colHead){
            this.colHead = true;
        }
        //head
        this.colHead = (colHead) ? true : false;
    }
    getDefaultColumns() {
        var keys = Object.keys(this.data[0]), columns = [];
        for (var i = 0; i < keys.length; i++) {
            columns.push({data: keys[i]});
        }
        return columns;
    }
    addRow(row) {
        this.data.push(row);
    }
    getData() {
        return this.data;
    }
    loadFromHTML(element) {
        // need to work
    }
    firstLetterCapitalized(str) {
        str = str.charAt(0).toUpperCase() + str.slice(1);
        return str;
    }
    createStyle(id, style = {}, requred = false) {
        var styleTag = "";
        if (style) {
            //Alignment
            var alignTag = "", halign = "", valign = "";
            if (style.halign || style.valign) {
                if (style.halign) {
                    var chalign = this.firstLetterCapitalized(style.halign);
                    halign = 'ss:Horizontal="' + chalign + '"';
                }
                if (style.valign) {
                    var cvalign = this.firstLetterCapitalized(style.valign);
                    valign = 'ss:Vertical="' + cvalign + '"';
                }
                alignTag = `<Alignment ${halign} ${valign}/>`;
            }
            //font
            var fontTag, fontName = "Liberation Serif", fontSize = "10", fontColor = "",
             bold ="", italic = "", underline = "";
            if (style.fontName || style.fontSize || style.textColor || style.bold || style.italic || style.underline) {
                if (style.fontName) {
                    fontName = style.fontName;
                }
                if (style.fontSize) {
                    fontSize = style.fontSize;
                }
                if (style.textColor) {
                    fontColor = `ss:Color="${style.textColor}"`;
                    if (! this.officeColors.includes(style.textColor)){
                        this.officeColors.push(style.textColor);
                    }
                }
                if (style.bold) {
                    bold = `ss:Bold="1"`;
                }
                if (style.italic) {
                    italic = `ss:Italic="1"`;
                }
                if (style.underline) {
                    underline = `ss:Underline="Single"`;
                }
            }
            fontTag = `<Font ss:FontName="${fontName}" ss:Size="${fontSize}" ${fontColor} ${bold} ${italic} ${underline}/>`;
            //Interior
            var interiorTag = "", fillColor = "", pattern = "";
            if (style.fillColor || style.pattern) {
                if (style.fillColor) {
                    fillColor = `ss:Color="${style.fillColor}"`;
                    if (! this.officeColors.includes(style.fillColor)){
                        this.officeColors.push(style.fillColor);
                    }
                }
                if (style.pattern) {
                    style.pattern = this.firstLetterCapitalized(style.pattern);
                    pattern = `ss:Pattern="${style.pattern}"`;
                } else {
                    pattern = `ss:Pattern="Solid"`;
                }
                interiorTag = `<Interior ${fillColor} ${pattern}/>`;
            }
            //Border
            var borderTag = "";
            if (style.border || this.borders) {
                 borderTag = `<Borders>
                 <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
                 <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
                 <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
                 <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#000000"/>
                 </Borders>`;
            }
            styleTag = `<Style ss:ID="${id}">${borderTag}${alignTag}${fontTag}${interiorTag}</Style>\n`;
        } else {
            if (requred) {
                styleTag = `<Style ss:ID="${id}"></Style>\n`;
            }
        }
        return styleTag;
    }
    createColor() {
        var colorElement = `<Colors>`;
        for (var i = 0; i < this.officeColors.length; i++){
            var index = (i + 3);
            colorElement += `<Color><Index>${index}</Index><RGB>${this.officeColors[i]}</RGB></Color>`;
        }
        colorElement += `</Colors>`;
        return colorElement;
    }
    createSource() {
        var source = `<?xml version="1.0" encoding="UTF-8"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:c="urn:schemas-microsoft-com:office:component:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x2="http://schemas.microsoft.com/office/excel/2003/xml" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">
        {{ColorsTag}}
        </OfficeDocumentSettings>
        <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
            <WindowHeight>9000</WindowHeight>
            <WindowWidth>13860</WindowWidth>
            <WindowTopX>240</WindowTopX>
            <WindowTopY>75</WindowTopY>
            <ProtectStructure>False</ProtectStructure>
            <ProtectWindows>False</ProtectWindows>
        </ExcelWorkbook>`, table = '<ss:Worksheet ss:Name="Sheet1"><Table ss:StyleID="ta1">', columns = '<Column ss:Width="64.0063"/><Column ss:Width="121.9464"/>', 
        styles = `<Styles>
        <Style ss:ID="Default" ss:Name="Default"/>
        <Style ss:ID="Result" ss:Name="Result"><Font ss:Bold="1" ss:Italic="1" ss:Underline="Single"/></Style>
        <Style ss:ID="Result2" ss:Name="Result2"><Font ss:Bold="1" ss:Italic="1" ss:Underline="Single"/><NumberFormat ss:Format="Currency"/></Style>
        <Style ss:ID="Heading" ss:Name="Heading"><Font ss:Bold="1" ss:Italic="1" ss:Size="16"/></Style>
        <Style ss:ID="Heading1" ss:Name="Heading1"><Font ss:Bold="1" ss:Italic="1" ss:Size="16"/></Style>`, rows = "";
        //bulid column heaeder
        if (this.colHead) {
            for (var i = 0; i < this.columns.length; i++) {
                if (i == 0) {
                    //start
                    rows += '<Row ss:AutoFitHeight="0" ss:Height="12.8126">';
                }
                //styles
                var style = "", styleID = ("ce" + (i + 1)), datatype, properties;
                if (! this.columns[i].properties) this.columns[i].properties = {};
                if(this.headerProperties && typeof this.headerProperties[i] !== 'undefined') {
                    properties = this.headerProperties[i];
                } else {
                    properties = this.defultHeaderProperties
                }
                style = this.createStyle(styleID, properties, true);
                styles += style;
                if (properties && properties.width > 0) {
                    //width
                    columns += `<Column ss:Width="${properties.width}"/>`;
                } else {
                    columns += `<Column ss:Width="64.0063"/>`;
                }
                if (this.columns[i].caption) {
                    rows += `<Cell ss:StyleID="${styleID}"><Data ss:Type="String">${this.columns[i].caption}</Data></Cell>\n`;
                } else {
                    rows += `<Cell ss:StyleID="${styleID}"><Data ss:Type="String"></Data></Cell>\n`;              
                }
                if ((this.columns.length - 1) == i) {
                    //end
                    rows += "</Row>";
                }
            }
        }
        //cells
        for (var i = 0; i < data.length; i++) {
            rows += '<Row ss:AutoFitHeight="0" ss:Height="12.8126">\n';
            for (var j = 0; j < this.columns.length; j++) {
                //styles// ((i + 1) * (j + 1)) //("ce" + (j + 1))
                var style = "", styleID, value = data[i][this.columns[j].data], datatype = "String";
                styleID = "ce" + (((i + 1) * this.columns.length) + (j + 1));
                //datatype
                if (this.columns[j].properties && this.columns[j].properties.datatype) {
                    datatype = this.firstLetterCapitalized(this.columns[j].properties.datatype);
                }
                if (this.callback.beforeCellCreate) {
                    var d = { row: i, cell: j, instance: this, value: value, properties: this.columns[j].properties, column: this.columns[j] };
                    var customData = this.callback.beforeCellCreation(d);
                    style = this.createStyle(styleID, customData.properties, true);
                    //change new value
                    if (customData.value) {
                        value = customData.value;
                    }
                    //datatype
                    if (customData.properties) {
                        datatype = this.firstLetterCapitalized(this.columns[j].properties.datatype);
                    }
                }
                if (! style) {
                    style = this.createStyle(styleID, this.columns[j].properties, true);
                }
                //add style
                styles += style;
                //datatype
                if (value) {
                    rows += `<Cell ss:StyleID="${styleID}"><Data ss:Type="${datatype}">${value}</Data></Cell>\n`;
                } else {
                    rows += `<Cell ss:StyleID="${styleID}"><Data ss:Type="${datatype}"></Data></Cell>\n`;
                }
            }
            rows += "</Row>\n";
        }
        styles += "</Styles>";
        table += columns + rows + `</Table><x:WorksheetOptions/></ss:Worksheet>`;
        source = source +  styles  + table;
        source += `</Workbook>`;
        var colorsTag = this.createColor();
        source = source.replace("{{ColorsTag}}", colorsTag);
        return source;
    }
    save(filename = "") {
        filename = (filename) ? filename : this.filename;
        var a = document.createElement("a");
        var content, file;
        content = this.createSource();
        a.download = filename; //download
        file = content;
        //console.log(content);
        var blobData = new Blob([file], {type: this.applictionType}); //application/xhtml+xml
        var url = window.URL.createObjectURL(blobData);
        a.href = url;
        a.click();
        a.remove();
    }
    headleBigData() {
        /*function longrun() { //async
            var runnerNo = 1000;
            var data = this.data
            var noofround = Math.ceil(data.length / runnerNo), activeround = 0;
         
            if (data.length > runnerNo) {
            for (var i = 1; i <= noofround; i++) {
                setTimeout(function() {
                    activeround++;
                    if (activeround == 1) { //start
                        //$("#ldsloader").show();
                    }
                    var start = ((activeround - 1) * runnerNo), end = (activeround * runnerNo), bodydata = [];
                    if(activeround == noofround) {
                        end = data.length;
                    }
                    for (var j = start; j < end; j++) {
                        bodydata.push(data[j]);
                    }
                    pdfSettings.body = bodydata;
                    //apply
                    d.autoTable(pdfSettings);
                    if (activeround == noofround) { //end
                        //$("#ldsloader").hide();
                        d.save(filename);
                    }
                }, (i * 100));
            } 
            } else {
                $("#ldsloader").show();
                pdfSettings.body = data;
                //apply
                d.autoTable(pdfSettings);
                $("#ldsloader").hide();
                d.save(filename);
            }
        }*/
    }
}