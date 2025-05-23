import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Plus, User, Users, MapPin, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import TopNav from '@/components/TopNav';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  creator_id: string;
  max_participants: number;
  current_participants: number;
  is_public: boolean;
}

const GroupEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateEventOpen, setIsCreateEventOpen] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    max_participants: 10,
    is_public: true,
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockEvents: Event[] = [
      {
        id: '1',
        name: 'BBQ Meetup',
        description: 'Casual BBQ at the park',
        date: '2024-08-15',
        location: 'Central Park',
        creator_id: user?.id || 'mockuser1',
        max_participants: 20,
        current_participants: 10,
        is_public: true,
      },
      {
        id: '2',
        name: 'Board Game Night',
        description: 'Fun board games at a local cafe',
        date: '2024-08-20',
        location: 'Cafe Central',
        creator_id: 'mockuser2',
        max_participants: 10,
        current_participants: 5,
        is_public: true,
      },
      {
        id: '3',
        name: 'Hiking Adventure',
        description: 'Explore local trails',
        date: '2024-08-25',
        location: 'Mountain Trail',
        creator_id: user?.id || 'mockuser1',
        max_participants: 15,
        current_participants: 8,
        is_public: false,
      },
    ];

    // Apply filters
    let filteredEvents = mockEvents;
    if (filter === 'my-events') {
      filteredEvents = mockEvents.filter(event => event.creator_id === user?.id);
    }

    // Apply search query
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setEvents(filteredEvents);
  }, [filter, searchQuery, user?.id]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateEventOpen = () => {
    setIsCreateEventOpen(true);
  };

  const handleCreateEventClose = () => {
    setIsCreateEventOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: checked }));
  };

  const handleCreateEvent = () => {
    // Mock create event - replace with actual API call
    const newEventId = Math.random().toString(36).substring(2);
    const newEventWithId = { ...newEvent, id: newEventId, creator_id: user?.id || 'mockuser1', current_participants: 0 };
    setEvents(prev => [...prev, newEventWithId]);
    handleCreateEventClose();
    toast({
      title: "Event Created",
      description: "Your event has been created successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="container max-w-6xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Group Events</h1>
          <Button onClick={handleCreateEventOpen}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="flex items-center mb-2 md:mb-0">
            <Label htmlFor="filter" className="mr-2">Filter:</Label>
            <Select onValueChange={value => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="my-events">My Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <Label htmlFor="search" className="mr-2">Search:</Label>
            <Input
              type="search"
              id="search"
              placeholder="Search events..."
              className="max-w-xs"
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {events.length === 0 ? (
          <Card className="text-center p-6">
            <CardHeader>
              <CardTitle>No Events Found</CardTitle>
              <CardDescription>
                {filter === 'my-events' ? 'You have not created any events yet.' : 'No events match your search criteria.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>
                <MapPin className="mr-2 h-4 w-4" />
                Explore Places
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableCaption>A list of your group events.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Event Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/event/${event.id}`)}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>

      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a New Event</DialogTitle>
            <DialogDescription>
              Create a new group event to share with others.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={newEvent.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                type="date"
                id="date"
                name="date"
                value={newEvent.date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                type="text"
                id="location"
                name="location"
                value={newEvent.location}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_participants" className="text-right">
                Max Participants
              </Label>
              <Input
                type="number"
                id="max_participants"
                name="max_participants"
                value={newEvent.max_participants}
                onChange={handleNumberInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_public" className="text-right">
                Public Event
              </Label>
              <Input
                type="checkbox"
                id="is_public"
                name="is_public"
                checked={newEvent.is_public}
                onChange={handleCheckboxChange}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupEvents;
