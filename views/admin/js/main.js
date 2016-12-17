function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
        $('.image-wrapper').css('display', 'inline-block');
        $('#imagePreview').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#imgInp").change(function(){
    readURL(this);
});

$('.image-wrapper > span').on('click', function(){
    $(this).parent().find('img').attr('src', '#');
    $('#imgInp').val('');
});