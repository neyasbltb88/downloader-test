class Downloader {
    constructor(params) {
        this.form = params.form;
        this.input = this.form.querySelector('input');

        // Прогресс
        this.progress_wrap = params.progress.wrap;
        this.value = params.progress.value;
        this.name = params.progress.name;
        this.bar = params.progress.bar;

        // Статистика
        this.statistic_wrap = params.statistic.wrap;
        this.speed = params.statistic.speed;
        this.loaded = params.statistic.loaded;
        this.remained = params.statistic.remained;

        // Управляющие классы
        this.classes = params.classes;

        // Флаг для одной одновременной загрузки
        this.isLoading = false;

        // Штамп времени для замера скорости закачки
        this.start_time = 0;
        // Здесь будет сохраняться текущая скорость загрузки,
        // чтобы не пересчитывать ее для статистики об оставшемся времени
        this.current_speed = 0;

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

        this.start_time = +new Date();
    }

    getRemained(loaded, total) {
        let speed = this.current_speed;
        let remained_bytes = total - loaded;
        let remained = Math.ceil(remained_bytes / speed);

        return `${remained} сек`
    }

    getSpeed(loaded) {
        let time_now = +new Date();
        let time = (time_now - this.start_time) / 1000;
        let speed = loaded / time;
        this.current_speed = speed;

        speed = Utils.FileSize(speed, true);

        return `${speed.size.toFixed(1)} ${speed.unit}/с`;
    }

    getLoaded(loaded, total) {
        return `${Utils.FileSize(loaded)} из ${Utils.FileSize(total)}`;
    }

    getPercent(loaded, total) {
        let percent = (loaded * 100) / total;
        return percent.toFixed(2);
    }

    xhrProgress(e) {
        let loaded = e.loaded;
        let total = e.total;
        let percent = this.getPercent(loaded, total) + '%';

        this.value.textContent = percent;
        this.bar.style.width = percent;

        // Обновление блока "Загружено:" из статистики
        this.loaded.textContent = this.getLoaded(loaded, total);

        // Обновление блока "Скорость:" из статистики
        this.speed.textContent = this.getSpeed(loaded);

        // Обновление блока "Осталось:" из статистики
        this.remained.textContent = this.getRemained(loaded, total);
    }

    xhrLoad(e) {
        download(e.target.response, this.filename);

        this.progress_wrap.classList.add(this.classes.complete);
        this.name.textContent += ' - Загружено';

        this.isLoading = false;
    }

    getName() {
        let name_parts = Utils.UrlParse(this.url);
        return name_parts.file.fileName;
    }

    init() {
        this.value.textContent = '0%';
        this.bar.style.width = '0%';

        setTimeout(() => {
            this.progress_wrap.classList.remove(this.classes.hide);
            this.progress_wrap.classList.remove(this.classes.complete);

            this.statistic_wrap.classList.remove(this.classes.hide);
        }, 0);

        this.url = this.input.value;
        this.filename = this.getName();
        this.name.textContent = this.filename;

        this.xhr();
    }
}


// 241kb
// https://pp.userapi.com/c849416/v849416154/14c94b/24duBkgusUg.jpg

// 736kb
// https://psv4.userapi.com/c848124/u451117072/docs/d5/8403f5fda7b1/dailywalls_13490.jpg

// 2.4mb
// https://psv4.userapi.com/c848136/u451117072/docs/d7/65d4afc4a315/dailywalls_12434.png

// 18.9mb
// https://vs1.coursehunters.net/hexlet-php-test/lesson5.mp4


window.downloader = new Downloader({
    form: document.querySelector('.url_wrap'),
    progress: {
        wrap: document.querySelector('.progress_wrap'),
        value: document.querySelector('.progress_value'),
        name: document.querySelector('.progress_name'),
        bar: document.querySelector('.progress_bar'),
    },
    statistic: {
        wrap: document.querySelector('.statistic_wrap'),
        speed: document.querySelector('.speed_value'),
        loaded: document.querySelector('.loaded_value'),
        remained: document.querySelector('.remained_value'),
    },
    classes: {
        hide: 'hide_progress',
        complete: 'complete_progress',
    },
});

class Utils {
    static FileSize(size = 0, extend = false) {
        size = +size;
        if (isNaN(size)) return false;
        let level_counter = 0;
        let levels = [
            'Б', 'КБ', 'МБ', 'ГБ', 'ТБ'
        ];

        function check(size) {
            if (size > 1024 && level_counter < 4) {
                level_counter++;
                return check(size / 1024);
            } else {
                return size;
            }
        }

        if (extend) {
            return {
                size: check(size),
                level: level_counter,
                unit: levels[level_counter],
            };
        } else {
            return `${check(size).toFixed(1)} ${levels[level_counter]}`;
        }
    }

    static UrlParse(url) {
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
}