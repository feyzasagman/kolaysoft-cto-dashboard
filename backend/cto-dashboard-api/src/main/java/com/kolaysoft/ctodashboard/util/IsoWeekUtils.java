package com.kolaysoft.ctodashboard.util;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;

/**
 * ISO-8601 hafta hesaplamaları.
 */
public final class IsoWeekUtils {

    private static final WeekFields ISO = WeekFields.ISO;

    private IsoWeekUtils() {
    }

    public static int currentWeekNumber() {
        return LocalDate.now().get(ISO.weekOfWeekBasedYear());
    }

    public static int currentWeekBasedYear() {
        return LocalDate.now().get(ISO.weekBasedYear());
    }

    public static int weekNumber(LocalDate date) {
        return date.get(ISO.weekOfWeekBasedYear());
    }

    public static int weekBasedYear(LocalDate date) {
        return date.get(ISO.weekBasedYear());
    }

    public static boolean isCurrentIsoWeek(Integer year, Integer weekNumber) {
        return year != null
                && weekNumber != null
                && year == currentWeekBasedYear()
                && weekNumber == currentWeekNumber();
    }

    public static Locale locale() {
        return Locale.getDefault();
    }
}
