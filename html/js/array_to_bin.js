var testArrayToBinDumper = function()
{
    var data = [1, 2, 3, 4, 5, 69, 69420, 420, 666];
    var test_blob = new Blob(
        [new Uint32Array(data)],
        {type: 'application/octet-stream'}
    );
    var editorDownload = function (data, file_name)
    {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(data);

        link.href = url;
        link.download = file_name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };
    editorDownload(test_blob, "rvice_sucks.bin");
};