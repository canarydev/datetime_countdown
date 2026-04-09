/** @odoo-module **/

import { Component, onWillUnmount, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { _t } from "@web/core/l10n/translation";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MIN_MS = 60 * 1000;
const SEC_MS = 1000;
const WEEK_DAYS = 7;
const MONTH_DAYS = 30;
const YEAR_DAYS = 365;

function unitLabel(value, singular, plural) {
    return Number(value) === 1 ? singular : plural;
}

function pad2(v) {
    return String(Math.max(0, Number(v) || 0)).padStart(2, "0");
}

function parseDeadline(value) {
    if (!value) return null;
    if (typeof value === "object" && typeof value.toJSDate === "function") {
        return value.toJSDate();
    }
    if (value instanceof Date) {
        return value;
    }
    const s = String(value || "").trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?$/);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]) - 1;
    const day = Number(m[3]);
    const hour = Number(m[4] || 0);
    const minute = Number(m[5] || 0);
    const second = Number(m[6] || 0);
    return new Date(Date.UTC(year, month, day, hour, minute, second));
}

class DatetimeCountdownField extends Component {
    setup() {
        this.state = useState({ nowTs: Date.now() });
        this._labels = {
            day: _t("day"),
            days: _t("days"),
            month: _t("month"),
            months: _t("months"),
            year: _t("year"),
            years: _t("years"),
            hour: _t("hour"),
            hours: _t("hours"),
            minute: _t("minute"),
            minutes: _t("minutes"),
            second: _t("second"),
            seconds: _t("seconds"),
            h: _t("h"),
        };
        this._timer = setInterval(() => {
            this.state.nowTs = Date.now();
        }, 1000);
        onWillUnmount(() => {
            if (this._timer) {
                clearInterval(this._timer);
                this._timer = null;
            }
        });
    }

    get deadline() {
        return parseDeadline(this.props.value);
    }

    get hasDeadline() {
        return !!this.deadline;
    }

    get remainingMs() {
        if (!this.deadline) return 0;
        return this.deadline.getTime() - this.state.nowTs;
    }

    get expired() {
        return this.hasDeadline && this.remainingMs <= 0;
    }

    get under24h() {
        return this.hasDeadline && this.remainingMs > 0 && this.remainingMs < DAY_MS;
    }

    _formatSingle(value, singular, plural) {
        return `${value} ${unitLabel(value, singular, plural)}`;
    }

    _formatDouble(v1, s1, p1, v2, s2, p2) {
        return `${v1} ${unitLabel(v1, s1, p1)} ${v2} ${unitLabel(v2, s2, p2)}`;
    }

    get countdownText() {
        const ms = Math.max(0, this.remainingMs);
        const totalSeconds = Math.floor(ms / SEC_MS);
        const totalHours = Math.floor(ms / HOUR_MS);
        const minutes = Math.floor((ms % HOUR_MS) / MIN_MS);
        const seconds = totalSeconds % 60;
        // < 24h => real countdown
        return `${pad2(totalHours)}:${pad2(minutes)}:${pad2(seconds)}`;
    }

    _formatLongRangeText() {
        const ms = Math.max(0, this.remainingMs);
        const totalDays = Math.floor(ms / DAY_MS);

        // < 1 week => "X days Y h"
        if (totalDays < WEEK_DAYS) {
            const days = totalDays;
            const hours = Math.floor((ms % DAY_MS) / HOUR_MS);
            return this._formatDouble(days, this._labels.day, this._labels.days, hours, this._labels.h, this._labels.h);
        }

        // < 1 month: days (and hours when important).
        if (totalDays < MONTH_DAYS) {
            const days = totalDays;
            const hours = Math.floor((ms % DAY_MS) / HOUR_MS);
            if (days <= 3 && hours > 0) {
                return this._formatDouble(
                    days,
                    this._labels.day,
                    this._labels.days,
                    hours,
                    this._labels.hour,
                    this._labels.hours
                );
            }
            return this._formatSingle(days, this._labels.day, this._labels.days);
        }

        // < 1 year: months (and days when important).
        if (totalDays < YEAR_DAYS) {
            const months = Math.floor(totalDays / MONTH_DAYS);
            const days = totalDays % MONTH_DAYS;
            if (months <= 2 && days > 0) {
                return this._formatDouble(
                    months,
                    this._labels.month,
                    this._labels.months,
                    days,
                    this._labels.day,
                    this._labels.days
                );
            }
            return this._formatSingle(months, this._labels.month, this._labels.months);
        }

        // >= 1 year: years (and months when important).
        const years = Math.floor(totalDays / YEAR_DAYS);
        const remainderDays = totalDays % YEAR_DAYS;
        const months = Math.floor(remainderDays / MONTH_DAYS);
        if (years <= 2 && months > 0) {
            return this._formatDouble(
                years,
                this._labels.year,
                this._labels.years,
                months,
                this._labels.month,
                this._labels.months
            );
        }
        return this._formatSingle(years, this._labels.year, this._labels.years);
    }

    get daysText() {
        return this._formatLongRangeText();
    }

    get deadlineLabel() {
        if (!this.deadline) return "";
        return this.deadline.toLocaleString();
    }
}

DatetimeCountdownField.template = "datetime_countdown_widget.DatetimeCountdownField";
DatetimeCountdownField.props = {
    ...standardFieldProps,
};
DatetimeCountdownField.displayName = "Datetime Countdown";
DatetimeCountdownField.supportedTypes = ["datetime"];

registry.category("fields").add("datetime_countdown", DatetimeCountdownField);
