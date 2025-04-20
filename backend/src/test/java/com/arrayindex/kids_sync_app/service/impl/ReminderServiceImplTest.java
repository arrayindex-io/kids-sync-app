package com.arrayindex.kids_sync_app.service.impl;

import com.arrayindex.kids_sync_app.model.Event;
import com.arrayindex.kids_sync_app.model.ReminderWindow;
import com.arrayindex.kids_sync_app.model.User;
import com.arrayindex.kids_sync_app.repository.EventRepository;
import com.arrayindex.kids_sync_app.repository.UserRepository;
import com.arrayindex.kids_sync_app.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class ReminderServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ReminderServiceImpl reminderService;

    @Captor
    private ArgumentCaptor<String> stringCaptor;

    private Event testEvent;
    private User testUser;
    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_EVENT_ID = "event123";

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setEmail(TEST_EMAIL);
        testUser.setName("Test User");

        // Create test event
        testEvent = new Event();
        testEvent.setId(TEST_EVENT_ID);
        testEvent.setName("Test Event");
        testEvent.setDateTime(LocalDateTime.now().plusHours(2)); // 2 hours in the future
        testEvent.setUserId(TEST_EMAIL); // userId is actually the email
        testEvent.setNotes("Test notes");

        // Mock userRepository to return our test user
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
    }

    @Test
    void testScheduleReminder_Success() {
        // Mock emailService to return success
        when(emailService.sendEventReminder(any(Event.class), anyString())).thenReturn(true);

        // Call the method under test
        reminderService.scheduleReminder(testEvent);

        // Verify interactions
        verify(userRepository).findByEmail(TEST_EMAIL);
        verify(emailService).sendEventReminder(testEvent, TEST_EMAIL);

        // Verify that the reminder was removed from scheduledReminders after successful sending
        ConcurrentHashMap<String, Boolean> scheduledReminders = 
                (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(reminderService, "scheduledReminders");
        assertFalse(scheduledReminders.containsKey(TEST_EVENT_ID));
    }

    @Test
    void testScheduleReminder_EmailFailure() {
        // Mock emailService to return failure
        when(emailService.sendEventReminder(any(Event.class), anyString())).thenReturn(false);

        // Call the method under test
        reminderService.scheduleReminder(testEvent);

        // Verify interactions
        verify(userRepository).findByEmail(TEST_EMAIL);
        verify(emailService).sendEventReminder(testEvent, TEST_EMAIL);

        // Verify that the reminder was not removed from scheduledReminders after failed sending
        ConcurrentHashMap<String, Boolean> scheduledReminders = 
                (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(reminderService, "scheduledReminders");
        assertTrue(scheduledReminders.containsKey(TEST_EVENT_ID));
    }

    @Test
    void testScheduleReminder_UserNotFound() {
        // Mock userRepository to return empty
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());

        // Call the method under test
        reminderService.scheduleReminder(testEvent);

        // Verify interactions
        verify(userRepository).findByEmail(TEST_EMAIL);
        verify(emailService, never()).sendEventReminder(any(Event.class), anyString());

        // Verify that the reminder is still in scheduledReminders (since sending failed)
        ConcurrentHashMap<String, Boolean> scheduledReminders = 
                (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(reminderService, "scheduledReminders");
        assertTrue(scheduledReminders.containsKey(TEST_EVENT_ID));
    }

    @Test
    void testCancelReminder() {
        // Add a reminder to the scheduledReminders map directly
        ConcurrentHashMap<String, Boolean> scheduledReminders = 
                (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(reminderService, "scheduledReminders");
        scheduledReminders.put(TEST_EVENT_ID, true);

        // Call the method under test
        reminderService.cancelReminder(TEST_EVENT_ID);

        // Verify that the reminder was removed
        assertFalse(scheduledReminders.containsKey(TEST_EVENT_ID));
    }

    @Test
    void testCheckAndSendReminders() {
        // Create a list of upcoming events
        LocalDateTime now = LocalDateTime.now();
        List<Event> upcomingEvents = new ArrayList<>();

        // Event 1: 30 minutes in the future (should trigger 1h reminder)
        Event event1 = new Event();
        event1.setId("event1");
        event1.setName("Event 1");
        event1.setDateTime(now.plusMinutes(30));
        event1.setUserId(TEST_EMAIL);
        upcomingEvents.add(event1);

        // Event 2: 5 hours in the future (should trigger 6h reminder)
        Event event2 = new Event();
        event2.setId("event2");
        event2.setName("Event 2");
        event2.setDateTime(now.plusHours(5));
        event2.setUserId(TEST_EMAIL);
        upcomingEvents.add(event2);

        // Event 3: in the past (should be removed from scheduled reminders)
        Event event3 = new Event();
        event3.setId("event3");
        event3.setName("Event 3");
        event3.setDateTime(now.minusHours(1));
        event3.setUserId(TEST_EMAIL);
        upcomingEvents.add(event3);

        // Mock repository to return our test events
        when(eventRepository.findByDateTimeBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(upcomingEvents);

        // Mock emailService to return success
        when(emailService.sendEventReminder(any(Event.class), anyString())).thenReturn(true);

        // Call the method under test
        reminderService.checkAndSendReminders();

        // Verify interactions
        verify(eventRepository).findByDateTimeBetween(any(LocalDateTime.class), any(LocalDateTime.class));
        verify(userRepository, times(3)).findByEmail(TEST_EMAIL);

        // Verify email service was called at least once
        // Note: The exact number of calls depends on the reminder windows configuration
        // and whether the events fall within those windows
        verify(emailService, atLeastOnce()).sendEventReminder(any(Event.class), eq(TEST_EMAIL));

        // Verify that event3 (past event) was removed from scheduledReminders
        ConcurrentHashMap<String, Boolean> scheduledReminders = 
                (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(reminderService, "scheduledReminders");
        assertFalse(scheduledReminders.containsKey("event3"));
    }

    @Test
    void testSendEventReminder() {
        // Mock emailService to return success
        when(emailService.sendEventReminder(testEvent, TEST_EMAIL)).thenReturn(true);

        // Call the method under test
        boolean result = reminderService.sendEventReminder(testEvent, TEST_EMAIL);

        // Verify result and interactions
        assertTrue(result);
        verify(emailService).sendEventReminder(testEvent, TEST_EMAIL);
    }

    @Test
    void testGetReminderWindows() {
        // Call the method under test
        List<ReminderWindow> windows = reminderService.getReminderWindows();

        // Verify result
        assertNotNull(windows);
        assertFalse(windows.isEmpty());

        // Verify that the windows are sorted by duration (longest first)
        double previousDuration = Double.MAX_VALUE;
        for (ReminderWindow window : windows) {
            assertTrue(window.getMaxDuration() <= previousDuration);
            previousDuration = window.getMaxDuration();
        }

        // Verify that the returned list is a defensive copy
        windows.clear();
        List<ReminderWindow> windowsAfterClear = reminderService.getReminderWindows();
        assertFalse(windowsAfterClear.isEmpty());
    }

    @Test
    void testIsInWindow() {
        // Create a reminder window for 1-2 hours
        ReminderWindow window = new ReminderWindow("test", 1, 2, true, "Test Window");

        // Test various scenarios using reflection with explicit return type
        Boolean inWindow = ReflectionTestUtils.invokeMethod(reminderService, "isInWindow", 1.5, window);
        assertTrue(inWindow); // In window

        Boolean atMinBoundary = ReflectionTestUtils.invokeMethod(reminderService, "isInWindow", 1.0, window);
        assertTrue(atMinBoundary); // At min boundary

        Boolean atMaxBoundary = ReflectionTestUtils.invokeMethod(reminderService, "isInWindow", 2.0, window);
        assertTrue(atMaxBoundary); // At max boundary

        Boolean belowMin = ReflectionTestUtils.invokeMethod(reminderService, "isInWindow", 0.5, window);
        assertFalse(belowMin); // Below min

        Boolean aboveMax = ReflectionTestUtils.invokeMethod(reminderService, "isInWindow", 2.5, window);
        assertFalse(aboveMax); // Above max
    }

    @Test
    void testHasReminderBeenSent() {
        String reminderKey = "test_key";
        ConcurrentHashMap<String, Boolean> sentReminders = 
                (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(reminderService, "sentReminders");

        // Initially, the reminder should not be marked as sent
        assertFalse(sentReminders.containsKey(reminderKey));

        // Mark the reminder as sent directly
        sentReminders.put(reminderKey, true);

        // Now the reminder should be marked as sent
        Boolean hasBeenSent = ReflectionTestUtils.invokeMethod(reminderService, "hasReminderBeenSent", reminderKey);
        assertTrue(hasBeenSent);
    }

    @Test
    void testGenerateReminderKey() {
        String eventId = "event123";
        String windowKey = "1h";

        String expectedKey = "event123_1h";
        String actualKey = ReflectionTestUtils.invokeMethod(reminderService, "generateReminderKey", eventId, windowKey);

        assertEquals(expectedKey, actualKey);
    }
}
