/**
 * DateRange value object for representing a period of time
 */
export class DateRange {
  constructor(
    private readonly startDate: Date,
    private readonly endDate: Date
  ) {
    this.validate()
  }

  private validate(): void {
    if (this.startDate > this.endDate) {
      throw new Error('Start date must be before or equal to end date')
    }
  }

  getStartDate(): Date {
    return new Date(this.startDate)
  }

  getEndDate(): Date {
    return new Date(this.endDate)
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate
  }

  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && other.startDate <= this.endDate
  }

  getDurationInDays(): number {
    const diffInMs = this.endDate.getTime() - this.startDate.getTime()
    return Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    )
  }
}
