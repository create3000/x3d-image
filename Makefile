.PHONY: tests
tests:
	npx . -d 1 -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/test.jpg
	npx . -a -s 1600x900 -i tests/IndexedFaceSet/IndexedFaceSet.x3d -o tests/view-all.png
