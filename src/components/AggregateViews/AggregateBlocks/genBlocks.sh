for step in Limit Skip Sample AddFields Lookup GraphLookup Count SortByCount Bucket Gacet Redact Out;do
     cp -n BlockDefinitions/Match.ddd.json BlockDefinitions/${step}.ddd.json
     cp -n BlockFunctions/Match.js BlockFunctions/${step}.js
     cp -n BlockTemplates/Match.hbs BlockTemplates/${step}.hbs
    ustep=`echo $step|tr  '[:lower:]' '[:upper:]'`
    echo "$ustep:{type: '$step', description: '$step',fields:{Expression: ''}}," 
done
    