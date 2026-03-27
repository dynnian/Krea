namespace Krea.Infrastructure.Setup {
    public class StreamFileAbstraction : TagLib.File.IFileAbstraction
    {
        public StreamFileAbstraction(string name, Stream readStream, Stream writeStream)
        {
            Name = name;
            ReadStream = readStream;
            WriteStream = writeStream;
        }

        public string Name { get; }
        public Stream ReadStream { get; }
        public Stream WriteStream { get; }

        public void CloseStream(Stream stream) => stream.Dispose();
    }
}