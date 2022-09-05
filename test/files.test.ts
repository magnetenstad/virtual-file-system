import { File, Directory } from '../src/files';
import fs from 'fs';

describe('File', () => {
  beforeEach(() => {
    fs.mkdirSync('test\\temp\\');
    fs.mkdirSync('test\\temp\\texts\\');
    fs.writeFileSync('test\\temp\\markdown.md', '# A basic markdown file');
    fs.writeFileSync('test\\temp\\texts\\text.txt', 'text');
  });

  afterEach(() => {
    fs.rmSync('test\\temp', { recursive: true, force: true });
  });

  it('Cannot read files that do not exist', () => {
    const file = File.read('void');
    expect(file).toBe(null);
  });

  it('Can read files', () => {
    const file = File.read('test\\temp\\markdown.md');
    expect(file).not.toBe(null);
    if (file == null) return;
    expect(file.name).toBe('markdown.md');
    expect(file.location).toBe('test\\temp\\');
    expect(file.data).toBe('# A basic markdown file');
  });

  it('Can get name without extension', () => {
    const file = File.read('test\\temp\\markdown.md');
    expect(file).not.toBe(null);
    if (file == null) return;
    expect(file.getNameWithoutExtension()).toBe('markdown');
  });

  it('Can save files', () => {
    const file = new File('new.md', 'A new test file.', {
      location: 'test\\temp\\',
    });
    file.write();
    const readFile = File.read('test\\temp\\new.md');
    expect(readFile).toEqual(file);
  });

  it('Can edit files', () => {
    const file = File.read('test\\temp\\markdown.md');
    expect(file).not.toBe(null);
    if (file == null) return;
    file.name = 'renamed.md';
    file.write();
    const renamed = File.read('test\\temp\\renamed.md');
    expect(renamed).not.toBe(null);
    if (renamed == null) return;
    expect(renamed.data).toBe(file.data);
  });

  it('Can read and write images', () => {
    // This does not actually guarantee that images work
    const file = File.read('test\\assets\\gull.jpg');
    expect(file).not.toBe(null);
    if (file == null) return;
    file.name = 'gull2.jpg';
    file.location = file.location.replace('assets', 'temp');
    file.write();
    const file2 = File.read('test\\temp\\gull2.jpg');
    expect(file2).not.toBe(null);
    if (file2 == null) return;
    expect(file.data).toEqual(file2.data);
  });
});

describe('Directory', () => {
  beforeEach(() => {
    fs.mkdirSync('test\\temp');
    fs.mkdirSync('test\\temp\\texts');
    fs.writeFileSync('test\\temp\\markdown.md', '# A basic markdown file');
    fs.writeFileSync('test\\temp\\texts\\text.txt', 'text');
  });

  afterEach(() => {
    fs.rmSync('test\\temp', { recursive: true, force: true });
  });

  it('Cannot read directories that do not exist', () => {
    const directory = Directory.read('void');
    expect(directory).toBe(null);
  });

  it('Can read directories', () => {
    const directory = Directory.read('test\\temp\\');
    expect(directory).not.toBe(null);
    if (directory == null) return;
    expect(directory.name).toBe('temp');
    expect(directory.files).toEqual([
      new File('markdown.md', '# A basic markdown file', {
        location: 'test\\temp\\',
      }),
    ]);
    expect(directory.directories.length).toBe(1);
    expect(directory.directories[0].name).toBe('texts');
    expect(directory.directories[0].files.length).toBe(1);
    expect(directory.directories[0].directories.length).toBe(0);
    expect(directory.directories[0].files[0]).toEqual(
      new File('text.txt', 'text', { location: 'test\\temp\\texts\\' })
    );
  });

  it('Can save directories', () => {
    const directory = new Directory('new', 'test\\temp\\');
    const file = new File('new.md', 'new file');
    directory.files.push(file);
    directory.write();
    const readFile = File.read('test\\temp\\new\\new.md');
    expect(readFile).not.toBe(null);
    if (readFile == null) return;
    expect(readFile.data).toBe(file.data);
  });

  it('Can edit directories', () => {
    const directory = Directory.read('test\\temp\\');
    expect(directory).not.toBe(null);
    if (directory == null) return;
    directory.name = 'renamed';
    directory.location += '\\temp\\';
    directory.write();
    const file = File.read('test\\temp\\texts\\text.txt');
    const renamed = File.read('test\\temp\\renamed\\texts\\text.txt');
    expect(file !== null && renamed).not.toBe(null);
    if (file == null || renamed == null) return;
    expect(renamed.data).toBe(file.data);
  });

  it('Can write contents', () => {
    const directory = Directory.read('test\\temp\\');
    expect(directory).not.toBe(null);
    if (directory == null) return;
    directory.writeContents('test\\temp\\texts\\');
    const subDirectory = Directory.read('test\\temp\\texts\\texts\\');
    expect(subDirectory).not.toBe(null);
    if (subDirectory == null) return;
    expect(directory.getDirectory('texts')?.getFile('text.txt')?.data).toBe(
      subDirectory.getFile('text.txt')?.data
    );
  });

  it('Can get directories and files', () => {
    const directory = Directory.read('test\\temp\\');
    expect(directory).not.toBe(null);
    if (directory == null) return;
    const subDirectory = directory.getDirectory('texts');
    expect(subDirectory).not.toBe(null);
    if (subDirectory == null) return;
    const text = subDirectory.getFile('text.txt');
    expect(text).not.toBe(null);
    if (text == null) return;
    expect(text.name).toBe('text.txt');
    expect(text.data).toBe('text');
    const textB = subDirectory.getFile(/ext.txt/);
    expect(text).toBe(textB);
    const textNull = subDirectory.getFile(/\bext.txt\b/);
    expect(textNull).toBe(null);
  });

  it('Can apply functions', () => {
    const directory = Directory.read('test\\temp\\');
    expect(directory).not.toBe(null);
    if (directory == null) return;
    directory.apply((file) => {
      file.name += '1';
      file.data += '1';
    });
    const file = directory.getFile('markdown.md1');
    expect(file).not.toBe(null);
    if (file == null) return;
    expect(file.data).toBe('# A basic markdown file1');
  });

  it('Can be filtered', () => {
    const directory = Directory.read('test\\temp\\');
    expect(directory).not.toBe(null);
    if (directory == null) return;
    const fileBefore = directory.getFile('markdown.md');
    expect(fileBefore).not.toBe(null);
    directory.filter((file) => {
      return file.name.match('markdown') == null;
    });
    const fileAfter = directory.getFile('markdown.md');
    expect(fileAfter).toBe(null);
  });
});
