class Downloader {
    constructor(params) {
        this.form = params.form;
        this.progress_wrap = params.progress_wrap;
        this.input = this.form.querySelector('input');
        this.value = params.value;
        this.name = params.name;
        this.bar = params.bar;
        this.classes = params.classes;

        this.isLoading = false;

        this.url = null;
        this.filename = null;
        this.percent = null;

        this.form.addEventListener('submit', e => {
            e.preventDefault();
            this.init();

            return false;
        });
    }

    xhr() {
        if (this.isLoading) return;
        this.isLoading = true;

        let xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.addEventListener('progress', this.xhrProgress.bind(this), false);
        xhr.addEventListener('load', this.xhrLoad.bind(this), false);

        xhr.open('GET', this.url, true);
        xhr.send();
    }

    xhrProgress(e) {
        let loaded = e.loaded;
        let total = e.total;
        let percent = this.getPercent(loaded, total) + '%';
        console.log('xhrProgress: ', percent);

        this.value.textContent = percent;
        this.bar.style.width = percent;
    }

    xhrLoad(e) {
        download(e.target.response, this.filename);

        // console.log(e.target.response);

        this.progress_wrap.classList.add(this.classes.complete);
        this.name.textContent += ' - Загружено';

        this.isLoading = false;
    }

    UrlParse(url) {
        var regex = /^(http\:\/\/|https\:\/\/|ftp\:\/\/)(.*?\..*?\/)(.*\/)*(.*)\.(.*)$/i;
        var result_obj = {};
        var result = url.match(regex);

        result_obj.schema = result[1];
        result_obj.host = result[2];
        result_obj.path = result[3].split('/');
        result_obj.path = result_obj.path.filter(function(item) {
            return item.length > 0;
        });
        result_obj.file = {
            'fileName': result[4] + '.' + result[5],
            'name': result[4],
            'ext': result[5]
        };

        return result_obj;
    }

    getName() {
        let name_parts = this.UrlParse(this.url);
        return name_parts.file.fileName;
    }

    getPercent(loaded, total) {
        let percent = (loaded * 100) / total;
        return percent.toFixed(2);
    }

    init() {
        this.value.textContent = '0%';
        this.bar.style.width = '0%';

        setTimeout(() => {
            this.progress_wrap.classList.remove(this.classes.hide);
            this.progress_wrap.classList.remove(this.classes.complete);
        }, 0);

        this.url = this.input.value;
        this.filename = this.getName();
        this.name.textContent = this.filename;

        this.xhr();
    }
}


// https://pp.userapi.com/c849416/v849416154/14c94b/24duBkgusUg.jpg

// https://psv4.userapi.com/c848124/u451117072/docs/d5/8403f5fda7b1/dailywalls_13490.jpg

// https://vs1.coursehunters.net/hexlet-php-test/lesson5.mp4


window.downloader = new Downloader({
    form: document.querySelector('.url_wrap'),
    progress_wrap: document.querySelector('.progress_wrap'),
    value: document.querySelector('.progress_value'),
    name: document.querySelector('.progress_name'),
    bar: document.querySelector('.progress_bar'),
    classes: {
        hide: 'hide_progress',
        complete: 'complete_progress',
    }
});