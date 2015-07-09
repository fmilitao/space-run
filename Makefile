
TARGET=../fmilitao.github.io/space-run

all:
	tsc

clean:
	rm -rf bin/

deploy:
	cp -Rv bin $(TARGET)
	cp -Rv font $(TARGET)
	cp index.html $(TARGET)/index.html
