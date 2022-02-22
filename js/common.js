
jQuery.fn.extend({
    // 反序列化表单数据
    serializeObject: function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    },
    btnDisabled: function(txt) { // 按钮点击后置灰
        this.html(txt);
        this.addClass("btn-disabled");
    },
    btnReset: function(txt) { // 按钮点击后置灰
        this.html(txt);
        this.removeClass("btn-disabled");
    }
});


