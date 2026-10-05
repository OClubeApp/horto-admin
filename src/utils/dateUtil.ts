import dayjs from 'dayjs';

function format(value: string | Date | null | undefined, pattern: string) {
    const date = dayjs(value ?? null);
    return date.isValid() ? date.format(pattern) : '-';
}

export function customFormatDate(value: string | Date | null | undefined) {
    return format(value, 'DD/MM/YYYY');
}

export function customFormatDateTime(value: string | Date | null | undefined) {
    return format(value, 'DD/MM/YYYY HH:mm:ss');
}
