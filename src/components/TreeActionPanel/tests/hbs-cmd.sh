if [ $# -eq 0 ] ;then
  echo "Usage this hbs json"
else
  node hbs-cmd.js ${2} <../Templates/$1
fi
