import React from "react";
import { Route } from "react-router-dom";
import { AnimationRoutes, ZMPRouter } from "zmp-ui";
import RequireRole from "@/components/common/RequireRole";
import { SYSTEM_ROLES } from "@/utils/permissions";

import {
    FeedbackPage,
    FeedbackDetailPage,
    CreateFeedbackPage,
} from "./Feedback";
import { GuidelinesPage } from "./Guidelines";
import { HomePage } from "./Home";
import { InformationGuidePage } from "./InformationGuide";
import { LegalDocumentsPage } from "./LegalDocuments";
import { NewsPage } from "./News";
import { NotificationsPage } from "./Notifications";
import { PublicServicesPage } from "./PublicServices";
import { JobsPage } from "./Jobs";
import { IndustrialZonesPage } from "./IndustrialZones";
import { OCOPPage } from "./OCOP";
import { BusinessesPage } from "./Businesses";
import { TrafficFinesPage } from "./TrafficFines";
import { CreateScheduleAppointmentPage } from "./CreateScheduleAppointment";
import { AppointmentScheduleResultPage } from "./AppointmentScheduleResult";
import { SearchPage } from "./Search";
import {
    AccountInfoPage,
    GovernmentContactPage,
    LoyaltyPointsPage,
    ProfilePage,
    SyncHistoryPage,
} from "./Profile";
import { RadioPage } from "./Radio";
import { TelevisionPage } from "./Television";
import NewsDetailPage from "./News/NewsDetailPage";
import DestinationsPage from "./Destinations/page";
import EventsPage from "./Events/page";
import LegalDocumentDetailPage from "./LegalDocuments/LegalDocumentDetailPage";
import OCOPDetailPage from "./OCOP/OCOPDetailPage";
import JobDetailPage from "./Jobs/JobDetailPage";
import IndustrialZoneDetailPage from "./IndustrialZones/IndustrialZoneDetailPage";
import { HotelPage } from "./Hotels";
import { RestaurantPage } from "./Restaurant";
import BusinessDetailPage from "./Businesses/BusinessDetailPage";
import { TransportPage } from "./Transports";
import { RemoteQueuePage } from "./RemoteQueue";
import { SatisfactionRatingPage } from "./SatisfactionRating";
import PrivacyPolicyPage from "./Profile/PrivacyPolicyPage";
import {
    MeetingAttendancePage,
    MeetingDetailPage,
    MeetingDocumentsPage,
    MeetingMinutesPage,
    MeetingNotificationsPage,
    MeetingRoomHomePage,
    MeetingSchedulePage,
} from "./MeetingRoomm";
import {
    CreateAssignedTaskPage,
    TaskAssignmentPage,
} from "./TaskAssignment";
import { ReceivedTasksPage } from "./ReceivedTasks";
import { WardTaskDetailPage } from "./WardTasks";
import { UserManagementPage } from "./UserManagement";

const meetingRoles = [
    SYSTEM_ROLES.WARD_CHAIRMAN,
    SYSTEM_ROLES.NEIGHBORHOOD_HEAD,
];

const withRoles = (element: React.ReactNode, roles: typeof meetingRoles) => (
    <RequireRole roles={roles}>{element}</RequireRole>
);

const Routes: React.FC = () => (
    <ZMPRouter>
        <AnimationRoutes>
            <Route path="/" element={<HomePage />} />
            <Route path="/index.html" element={<HomePage />} />
            <Route path="/hanh-chinh-cong" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/legal-documents" element={<LegalDocumentsPage />} />
            <Route
                path="/legal-documents/:id"
                element={<LegalDocumentDetailPage />}
            />
            <Route path="/public-services" element={<PublicServicesPage />} />
            <Route path="/remote-queue" element={<RemoteQueuePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/industrial-zones" element={<IndustrialZonesPage />} />
            <Route
                path="/industrial-zones/:id"
                element={<IndustrialZoneDetailPage />}
            />
            <Route path="/businesses" element={<BusinessesPage />} />
            <Route path="/businesses/:id" element={<BusinessDetailPage />} />
            <Route path="/traffic-fines" element={<TrafficFinesPage />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/television" element={<TelevisionPage />} />
            <Route path="/ocop" element={<OCOPPage />} />
            <Route path="/ocops/:id" element={<OCOPDetailPage />} />
            <Route path="/guidelines" element={<GuidelinesPage />} />

            <Route path="/feedbacks" element={<FeedbackPage />} />
            <Route path="/feedbacks/:id" element={<FeedbackDetailPage />} />
            <Route path="/create-feedback" element={<CreateFeedbackPage />} />
            <Route
                path="/create-schedule-appointment"
                element={<CreateScheduleAppointmentPage />}
            />
            <Route
                path="/schedule-appointment-result"
                element={<AppointmentScheduleResultPage />}
            />
            <Route
                path="/satisfaction-rating"
                element={<SatisfactionRatingPage />}
            />
            <Route
                path="/information-guide"
                element={<InformationGuidePage />}
            />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/account-info" element={<AccountInfoPage />} />
            <Route
                path="/government-contact"
                element={<GovernmentContactPage />}
            />
            <Route path="/loyalty-points" element={<LoyaltyPointsPage />} />
            <Route path="/sync-history" element={<SyncHistoryPage />} />
            <Route path="/destinations" element={<DestinationsPage />} />
            <Route path="/hotels" element={<HotelPage />} />
            <Route path="/transport" element={<TransportPage />} />
            <Route path="/restaurants" element={<RestaurantPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route
                path="/meeting-rooms"
                element={withRoles(<MeetingRoomHomePage />, meetingRoles)}
            />
            <Route
                path="/meeting-rooms/schedule"
                element={withRoles(<MeetingSchedulePage />, meetingRoles)}
            />
            <Route
                path="/meeting-rooms/documents"
                element={withRoles(<MeetingDocumentsPage />, meetingRoles)}
            />
            <Route
                path="/meeting-rooms/minutes"
                element={withRoles(<MeetingMinutesPage />, meetingRoles)}
            />
            <Route
                path="/meeting-rooms/attendance"
                element={withRoles(<MeetingAttendancePage />, meetingRoles)}
            />
            <Route
                path="/meeting-rooms/notifications"
                element={withRoles(<MeetingNotificationsPage />, meetingRoles)}
            />
            <Route
                path="/meeting-rooms/:id"
                element={withRoles(<MeetingDetailPage />, meetingRoles)}
            />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/task-assignments" element={<TaskAssignmentPage />} />
            <Route
                path="/task-assignments/create"
                element={<CreateAssignedTaskPage />}
            />
            <Route path="/received-tasks" element={<ReceivedTasksPage />} />
            <Route path="/ward-tasks/:id" element={<WardTaskDetailPage />} />
        </AnimationRoutes>
    </ZMPRouter>
);

export default Routes;
