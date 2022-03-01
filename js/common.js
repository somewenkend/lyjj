
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

// 身份证校验
var idCardNoUtil = {
    /*省,直辖市代码表*/
    provinceAndCitys: {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",
        31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",
        45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",
        65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"},

    /*每位加权因子*/
    powers: ["7","9","10","5","8","4","2","1","6","3","7","9","10","5","8","4","2"],

    /*第18位校检码*/
    parityBit: ["1","0","X","9","8","7","6","5","4","3","2"],

    /*性别*/
    genders: {male:"M",female:"F"},

    /*校验地址码*/
    checkAddressCode: function(addressCode){
        var check = /^[1-9]\d{5}$/.test(addressCode);
        if(!check) return false;
        if(idCardNoUtil.provinceAndCitys[parseInt(addressCode.substring(0,2))]){
            return true;
        }else{
            return false;
        }
    },

    /*校验日期码*/
    checkBirthDayCode: function(birDayCode){
        var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(birDayCode);
        if(!check) return false;
        var yyyy = parseInt(birDayCode.substring(0,4),10);
        var mm = parseInt(birDayCode.substring(4,6),10);
        var dd = parseInt(birDayCode.substring(6),10);
        var xdata = new Date(yyyy,mm-1,dd);
        if(xdata > new Date()){
            return false;//生日不能大于当前日期
        }else if ( ( xdata.getFullYear() == yyyy ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == dd ) ){
            return true;
        }else{
            return false;
        }
    },

    /*计算校检码*/
    getParityBit: function(idCardNo){
        var id17 = idCardNo.substring(0,17);
        /*加权 */
        var power = 0;
        for(var i=0;i<17;i++){
            power += parseInt(id17.charAt(i),10) * parseInt(idCardNoUtil.powers[i]);
        }
        /*取模*/
        var mod = power % 11;
        return idCardNoUtil.parityBit[mod];
    },

    /*验证校检码*/
    checkParityBit: function(idCardNo){
        var parityBit = idCardNo.charAt(17).toUpperCase();
        if(idCardNoUtil.getParityBit(idCardNo) == parityBit){
            return true;
        }else{
            return false;
        }
    },

    /*校验15位或18位的身份证号码*/
    checkIdCardNo: function(idCardNo){
        //15位和18位身份证号码的基本校验
        var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
        if(!check) return false;
        //判断长度为15位或18位
        if(idCardNo.length==15){
            return idCardNoUtil.check15IdCardNo(idCardNo);
        }else if(idCardNo.length==18){
            return idCardNoUtil.check18IdCardNo(idCardNo);
        }else{
            return false;
        }
    },

    //校验15位的身份证号码
    check15IdCardNo: function(idCardNo){
        //15位身份证号码的基本校验
        var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo);
        if(!check) return false;
        //校验地址码
        var addressCode = idCardNo.substring(0,6);
        check = idCardNoUtil.checkAddressCode(addressCode);
        if(!check) return false;
        var birDayCode = '19' + idCardNo.substring(6,12);
        //校验日期码
        check = idCardNoUtil.checkBirthDayCode(birDayCode);
        if(!check) return false;
        //验证校检码
        return idCardNoUtil.checkParityBit(idCardNo);
    },

    //校验18位的身份证号码
    check18IdCardNo: function(idCardNo){
        //18位身份证号码的基本格式校验
        var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idCardNo);
        if(!check) return false;
        //校验地址码
        var addressCode = idCardNo.substring(0,6);
        check = idCardNoUtil.checkAddressCode(addressCode);
        if(!check) return false;
        //校验日期码
        var birDayCode = idCardNo.substring(6,14);
        check = idCardNoUtil.checkBirthDayCode(birDayCode);
        if(!check) return false;
        //验证校检码
        return idCardNoUtil.checkParityBit(idCardNo);
    },

    formateDateCN: function(day){
        var yyyy =day.substring(0,4);
        var mm = day.substring(4,6);
        var dd = day.substring(6);
        return yyyy + '-' + mm +'-' + dd;
    },

    //获取信息
    getIdCardInfo: function(idCardNo){
        var idCardInfo = {
            gender:"",  //性别
            birthday:"" // 出生日期(yyyy-mm-dd)
        };
        if(idCardNo.length==15){
            var aday = '19' + idCardNo.substring(6,12);
            idCardInfo.birthday=idCardNoUtil.formateDateCN(aday);
            if(parseInt(idCardNo.charAt(14))%2==0){
                idCardInfo.gender=idCardNoUtil.genders.female;
            }else{
                idCardInfo.gender=idCardNoUtil.genders.male;
            }
        }else if(idCardNo.length==18){
            var aday = idCardNo.substring(6,14);
            idCardInfo.birthday=idCardNoUtil.formateDateCN(aday);
            if(parseInt(idCardNo.charAt(16))%2==0){
                idCardInfo.gender=idCardNoUtil.genders.female;
            }else{
                idCardInfo.gender=idCardNoUtil.genders.male;
            }

        }
        return idCardInfo;
    },

    /*18位转15位*/
    getId15: function(idCardNo){
        if(idCardNo.length==15){
            return idCardNo;
        }else if(idCardNo.length==18){
            return idCardNo.substring(0,6) + idCardNo.substring(8,17);
        }else{
            return null;
        }
    },

    /*15位转18位*/
    getId18: function(idCardNo){
        if(idCardNo.length==15){
            var id17 = idCardNo.substring(0,6) + '19' + idCardNo.substring(6);
            var parityBit = idCardNoUtil.getParityBit(id17);
            return id17 + parityBit;
        }else if(idCardNo.length==18){
            return idCardNo;
        }else{
            return null;
        }
    }
};

$(document).ready(function() {
    var headerContent = `
        <div class="top">
            <h4><i class="fa fa-fire mr5"></i>欢迎您来到洛阳市老城区民营经济服务平台</h4>
            <div class="link">
                <a href="#" class="ml20"><i class="fa fa-location-arrow fa-fw"></i>登录</a>
                <a href="#" class="ml20"><i class="fa fa-user-plus fa-fw"></i>注册</a>
                <a href="#" class="ml20"><i class="fa fa-info-circle fa-fw"></i>关于我们</a>
                <a href="#" class="ml20"><i class="fa fa-phone fa-fw"></i>联系我们</a>
                <a href="#" class="ml20"><i class="fa fa-cog fa-fw"></i>设置</a>
            </div>
        </div>
    `;
    var menuContent = `
        <div class="module" id="1">
            <a href="#">首页</a>
        </div>
        <div class="module" id="2">
            <a href="#">企业家培训</a>
        </div>
        <div class="module" id="3">
            <a href="#">企业诉求</a>
        </div>
        <div class="module" id="4">
            <a href="#">政策宣讲</a>
        </div>
        <div class="module" id="5">
            <a href="#">银企对接</a>
        </div>
        <div class="module" id="6">
            <a href="#">产销对接</a>
        </div>
        <div class="module" id="7">
            <a href="#">项目对接</a>
        </div>
        <div class="module" id="8">
            <a href="#">科技成果转换</a>
        </div>
        <div class="module" id="9">
            <a href="#">劳务对接</a>
        </div>
        <div class="module" id="10">
            <a href="#">民营企业评议</a>
        </div>
        <div class="module" id="11">
            <a href="#">中介平台</a>
        </div>
        <div class="module" id="12">
            <a href="#">司法综合服务</a>
        </div>
        <div class="module" id="13">
            <a href="#">无人助万企</a>
        </div>
        <div class="module" id="14">
            <a href="#">民企荣誉</a>
        </div>
        <div class="module" id="15">
            <a href="#">乡村振兴</a>
        </div>
        <div class="module" id="16">
            <a href="#">新闻资询</a>
        </div>
        <div class="module" id="17">
            <a href="#">商会展示</a>
        </div>
    `;
    var footerContent = `
        <div class="link-box">
            <div class="row">
                <div class="col-sm-4">
                    <p>
                        <a href="#">
                            <i class="fa fa-caret-right mr5"></i>关于我们
                        </a>
                        <a href="#" class="ml20">
                            <i class="fa fa-caret-right mr5"></i>联系我们
                        </a>
                    </p>
                    <p>建设单位：xxxxxxxxxxxx</p>
                    <p>技术支持：xxxxxxxxxxxx</p>
                </div>
                <div class="col-sm-4"></div>
                <div class="col-sm-4">
                    <p>友情链接</p>
                    <p><a href="#"><i class="fa fa-caret-right mr5"></i>xxxxxxxxx</a></p>
                    <p><a href="#"><i class="fa fa-caret-right mr5"></i>xxxxxxxxx</a></p>
                    <p><a href="#"><i class="fa fa-caret-right mr5"></i>xxxxxxxxx</a></p>
                </div>
            </div>
        </div>
        <p class="copyright">版权说明</p>
    `;
    // 头部
    if ($("header").length > 0) {
        $("header").html(headerContent);
    }
    // 菜单
    if ($("#menu").length > 0) {
        $("#menu").html(menuContent);
    }
    // 脚部
    if ($("footer").length > 0) {
        $("footer").html(footerContent);
    }
})

// 选中对应的菜单
function focusMenu(id) {
    $("#menu").find(".module").removeClass("active");
    $("#menu").find(".module#"+id).addClass("active");
    $("#menu").animate({
        scrollLeft: $("#menu").find(".module#"+id).index() * 150
    }, 0);
}


