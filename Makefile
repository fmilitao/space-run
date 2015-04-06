all :
	tsc

clean :
	rm ./bin/*.js

me :
	tsc -out ./bin/file.js
