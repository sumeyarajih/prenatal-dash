/**
 * Pregnancy Calculator Service
 * All calculations based on Last Menstrual Period (LMP) date
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const FULL_TERM_DAYS = 280; // 40 weeks

/**
 * Calculate due date from LMP
 * @param {Date} lmpDate
 * @returns {Date}
 */
const calculateDueDate = (lmpDate) => {
    const lmp = new Date(lmpDate);
    return new Date(lmp.getTime() + FULL_TERM_DAYS * MS_PER_DAY);
};

/**
 * Calculate current gestational week (1-based)
 * @param {Date} lmpDate
 * @returns {number} 1-42
 */
const calculateCurrentWeek = (lmpDate) => {
    const lmp = new Date(lmpDate);
    const elapsed = Date.now() - lmp.getTime();
    const week = Math.floor(elapsed / MS_PER_WEEK) + 1;
    return Math.max(1, Math.min(42, week));
};

/**
 * Determine trimester from week number
 * @param {number} week
 * @returns {1|2|3}
 */
const getTrimester = (week) => {
    if (week <= 13) return 1;
    if (week <= 26) return 2;
    return 3;
};

/**
 * Days remaining until due date
 * @param {Date} dueDate
 * @returns {number}
 */
const getDaysRemaining = (dueDate) => {
    const remaining = new Date(dueDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(remaining / MS_PER_DAY));
};

/**
 * Percentage of pregnancy complete
 * @param {Date} lmpDate
 * @returns {number} 0-100
 */
const getPercentageComplete = (lmpDate) => {
    const elapsed = Date.now() - new Date(lmpDate).getTime();
    const total = FULL_TERM_DAYS * MS_PER_DAY;
    const pct = (elapsed / total) * 100;
    return Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
};

/**
 * Full pregnancy progress summary
 * @param {Date} lmpDate
 * @returns {Object}
 */
const getPregnancyProgress = (lmpDate) => {
    const dueDate = calculateDueDate(lmpDate);
    const currentWeek = calculateCurrentWeek(lmpDate);
    const currentTrimester = getTrimester(currentWeek);
    const daysRemaining = getDaysRemaining(dueDate);
    const percentageComplete = getPercentageComplete(lmpDate);

    return {
        lmpDate: new Date(lmpDate),
        dueDate,
        currentWeek,
        currentTrimester,
        daysRemaining,
        percentageComplete,
        weeksRemaining: Math.ceil(daysRemaining / 7),
        isOverdue: daysRemaining === 0 && Date.now() > dueDate.getTime(),
    };
};

module.exports = {
    calculateDueDate,
    calculateCurrentWeek,
    getTrimester,
    getDaysRemaining,
    getPercentageComplete,
    getPregnancyProgress,
};
