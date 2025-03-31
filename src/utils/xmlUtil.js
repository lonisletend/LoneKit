export function formatXml(xml, colorize, indent) {
  function esc(s) {
    return s.replace(/[-\/&<> ]/g, function (c) {         // Escape special chars
      return c == ' ' ? '&nbsp;' : '&#' + c.charCodeAt(0) + ';';
    });
  }
  var sm = '<div class="xmt">', se = '<div class="xel">', sd = '<div class="xdt">',
    sa = '<div class="xat">', tb = '<div class="xtb">', tc = '<div class="xtc">',
    ind = indent || '  ', sz = '</div>', tz = '</div>', re = '', is = '', ib, ob, at, i;
  if (!colorize) sm = se = sd = sa = sz = '';
  xml.match(/(?<=<).*(?=>)|$/s)[0].split(/>\s*</).forEach(function (nd) {
    ob = ('<' + nd + '>').match(/^(<[!?\/]?)(.*?)([?\/]?>)$/s);             // Split outer brackets
    ib = ob[2].match(/^(.*?)>(.*)<\/(.*)$/s) || ['', ob[2], ''];            // Split inner brackets 
    at = ib[1].match(/^--.*--$|=|('|").*?\1|[^\t\n\f \/>"'=]+/g) || ['']; // Split attributes
    if (ob[1] == '</') is = is.substring(ind.length);                     // Decrease indent
    re += tb + tc + esc(is) + tz + tc + sm + esc(ob[1]) + sz + se + esc(at[0]) + sz;
    for (i = 1; i < at.length; i++) re += (at[i] == "=" ? sm + "=" + sz + sd + esc(at[++i]) : sa + ' ' + at[i]) + sz;
    re += ib[2] ? sm + esc('>') + sz + sd + esc(ib[2]) + sz + sm + esc('</') + sz + se + ib[3] + sz : '';
    re += sm + esc(ob[3]) + sz + tz + tz;
    if (ob[1] + ob[3] + ib[2] == '<>') is += ind;                             // Increase indent
  });
  return re;
}

export function prettifyXml(sourceXml) {
  // Check for XML declaration
  const hasDeclaration = sourceXml.trim().startsWith('<?xml');
  let declaration = '';

  if (hasDeclaration) {
    // Extract the declaration
    const match = sourceXml.match(/^<\?xml[^>]*\?>/);
    if (match) {
      declaration = match[0];
    }
  }

  var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
  var xsltDoc = new DOMParser().parseFromString([
    // describes how we want to modify the XML - indent everything
    '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
    '  <xsl:strip-space elements="*"/>',
    '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
    '    <xsl:value-of select="normalize-space(.)"/>',
    '  </xsl:template>',
    '  <xsl:template match="node()|@*">',
    '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
    '  </xsl:template>',
    '  <xsl:output indent="yes"/>',
    '</xsl:stylesheet>',
  ].join('\n'), 'application/xml');

  var xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  var resultXml = new XMLSerializer().serializeToString(resultDoc);

  // Add the declaration back if it was present
  if (hasDeclaration) {
    resultXml = declaration + '\n' + resultXml;
  }

  return resultXml;
};