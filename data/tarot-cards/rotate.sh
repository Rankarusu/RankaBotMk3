for szFile in *.jpg
do 
    convert "$szFile" -rotate 180 "${szFile/.jpg/-r.jpg}"; 
done