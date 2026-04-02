const jobTitle: string = "Manager";
const age: number = 23;
const isSleeping: boolean = true;

const jobCategories: string[] = ["doctor", "engineer", "star"];
let applicantIds: number[] = [23, 45, 65];

interface Applicant {
  name: string;
  email: string;
  age?: number;
  isAvailable: boolean;
}

const applicant: Applicant = {
  name: "Najmul",
  email: "niamul@gmail.com",
  isAvailable: true,
};

function getFullName(first: string, last: string): string {
  return first + last;
}
getFullName("najmul", "hasan");

enum NotificationStatus {
  Unread = "unread",
  Read = "read",
  Archived = "archived",
}

const status1: NotificationStatus = NotificationStatus.Archived;

enum ApplicationStatus {
  Pending = "pending",
  Reviewed = "reviewed",
  Accepted = "accepted",
  Rejected = "rejected",
}

const myStatus: ApplicationStatus = ApplicationStatus.Pending;

type ID = string;
const userId: ID = "hnskdfi-2423";
console.log(userId);
