/**
 * Integration Tests for Photos Management Page
 * Tests photo upload, deletion, filtering, bulk operations, and category management
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import PhotosManagement from '../../../pages/AdminDashboard/PhotosManagement';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock data
const mockClasses = [
  { id: 'class-1', name: 'Soccer Stars U6' },
  { id: 'class-2', name: 'Lightning Bolts U8' },
];

const mockPhotos = [
  {
    id: 'photo-1',
    image_url: '/uploads/photos/photo1.jpg',
    thumbnail_url: '/uploads/photos/photo1_thumb.jpg',
    caption: 'Team practice session',
    class_id: 'class-1',
    class_name: 'Soccer Stars U6',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'photo-2',
    image_url: '/uploads/photos/photo2.jpg',
    thumbnail_url: '/uploads/photos/photo2_thumb.jpg',
    caption: 'Tournament day',
    class_id: 'class-2',
    class_name: 'Lightning Bolts U8',
    created_at: '2024-03-05T00:00:00Z',
  },
  {
    id: 'photo-3',
    image_url: '/uploads/photos/photo3.jpg',
    thumbnail_url: '/uploads/photos/photo3_thumb.jpg',
    caption: null,
    class_id: 'class-1',
    class_name: 'Soccer Stars U6',
    created_at: '2024-03-10T00:00:00Z',
  },
];

const mockAlbums = [
  { id: 'album-1', name: 'Tournaments', description: 'Tournament photos' },
  { id: 'album-2', name: 'Practice', description: 'Practice session photos' },
];

describe('Photos Management Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    server.use(
      http.get(`${API_BASE}/photos`, () => {
        return HttpResponse.json({ items: mockPhotos, total: mockPhotos.length });
      }),
      http.get(`${API_BASE}/photos/class/:classId`, ({ params }) => {
        const classId = params.classId as string;
        const filtered = mockPhotos.filter(p => p.class_id === classId);
        return HttpResponse.json(filtered);
      }),
      http.get(`${API_BASE}/classes`, () => {
        return HttpResponse.json({ items: mockClasses, total: mockClasses.length });
      }),
      http.get(`${API_BASE}/photos/albums`, () => {
        return HttpResponse.json({ items: mockAlbums, total: mockAlbums.length });
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // PAGE LOADING TESTS
  // ===========================================
  describe('Page Loading', () => {
    it('should render page title and description', async () => {
      render(<PhotosManagement />);

      expect(screen.getByText('Photos Management')).toBeInTheDocument();
      expect(screen.getByText(/Upload and manage class photos/i)).toBeInTheDocument();
    });

    it('should display Upload Photos button', async () => {
      render(<PhotosManagement />);

      expect(screen.getByText('Upload Photos')).toBeInTheDocument();
    });

    it('should display New Category button', async () => {
      render(<PhotosManagement />);

      expect(screen.getByText('New Category')).toBeInTheDocument();
    });

    it('should load and display photos in grid', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should display photo captions', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        expect(screen.getByText('Team practice session')).toBeInTheDocument();
      });

      expect(screen.getByText('Tournament day')).toBeInTheDocument();
    });

    it('should display class name badges on photos', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        const classBadges = screen.getAllByText('Soccer Stars U6');
        expect(classBadges.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display category quick access buttons', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        expect(screen.getByText('Tournaments')).toBeInTheDocument();
      });

      expect(screen.getByText('Practice')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SEARCH / FILTERING TESTS
  // ===========================================
  describe('Search and Filtering', () => {
    it('should display search input', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getByPlaceholderText(/Search photos/i)).toBeInTheDocument();
    });

    it('should filter photos by caption search', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const searchInput = screen.getByPlaceholderText(/Search photos/i);
      await user.type(searchInput, 'practice');

      await waitFor(() => {
        expect(screen.getByText('Team practice session')).toBeInTheDocument();
        expect(screen.queryByText('Tournament day')).not.toBeInTheDocument();
      });
    });

    it('should filter photos by class name in search', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const searchInput = screen.getByPlaceholderText(/Search photos/i);
      await user.type(searchInput, 'Lightning');

      await waitFor(() => {
        expect(screen.getByText('Tournament day')).toBeInTheDocument();
        expect(screen.queryByText('Team practice session')).not.toBeInTheDocument();
      });
    });

    it('should display class filter dropdown', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getByText('All Classes')).toBeInTheDocument();
    });

    it('should filter photos by class via API', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const classFilter = screen.getByDisplayValue('');
      fireEvent.change(classFilter, { target: { value: 'class-1' } });

      await waitFor(() => {
        // Should reload with class-1 filter
        const classBadges = screen.getAllByText('Soccer Stars U6');
        expect(classBadges.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ===========================================
  // PHOTO SELECTION TESTS
  // ===========================================
  describe('Photo Selection', () => {
    it('should toggle photo selection on click', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      // Click on first photo to select it
      const images = screen.getAllByRole('img');
      const photoContainer = images[0].closest('div[class*="cursor-pointer"]');
      if (photoContainer) {
        await user.click(photoContainer);
      }

      await waitFor(() => {
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });
    });

    it('should show Delete button when photos are selected', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const images = screen.getAllByRole('img');
      const photoContainer = images[0].closest('div[class*="cursor-pointer"]');
      if (photoContainer) {
        await user.click(photoContainer);
      }

      await waitFor(() => {
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should select all photos with Select All button', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const selectAllButton = screen.getByText('Select All');
      await user.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText(/3 selected/i)).toBeInTheDocument();
      });
    });

    it('should deselect all photos with Deselect All button', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const selectAllButton = screen.getByText('Select All');
      await user.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText('Deselect All')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Deselect All'));

      await waitFor(() => {
        expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
      });
    });

    it('should clear selection with X button', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const images = screen.getAllByRole('img');
      const photoContainer = images[0].closest('div[class*="cursor-pointer"]');
      if (photoContainer) {
        await user.click(photoContainer);
      }

      await waitFor(() => {
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });

      // Find clear selection button (X icon next to Delete)
      const clearButtons = screen.getAllByRole('button');
      const clearBtn = clearButtons.find(btn => btn.querySelector('svg') && btn.className.includes('text-gray-400'));
      if (clearBtn) {
        await user.click(clearBtn);
      }
    });
  });

  // ===========================================
  // BULK DELETE TESTS
  // ===========================================
  describe('Bulk Delete', () => {
    it('should open delete confirmation when clicking Delete button', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      // Select a photo
      const images = screen.getAllByRole('img');
      const photoContainer = images[0].closest('div[class*="cursor-pointer"]');
      if (photoContainer) {
        await user.click(photoContainer);
      }

      await waitFor(() => {
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Delete Photos')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete 1 photo/i)).toBeInTheDocument();
      });
    });

    it('should delete selected photos on confirm', async () => {
      const user = userEvent.setup();
      let deletedIds: string[] = [];

      server.use(
        http.delete(`${API_BASE}/photos/:id`, ({ params }) => {
          deletedIds.push(params.id as string);
          return HttpResponse.json({ message: 'Deleted' });
        })
      );

      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      // Select all photos
      const selectAllButton = screen.getByText('Select All');
      await user.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText(/3 selected/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Delete Photos')).toBeInTheDocument();
      });

      const deleteConfirm = screen.getAllByRole('button').find(
        btn => btn.textContent === 'Delete Photos' && btn.closest('.fixed')
      );
      if (deleteConfirm) {
        await user.click(deleteConfirm);
      }

      await waitFor(() => {
        expect(deletedIds.length).toBe(3);
      });
    });

    it('should cancel bulk delete', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const images = screen.getAllByRole('img');
      const photoContainer = images[0].closest('div[class*="cursor-pointer"]');
      if (photoContainer) {
        await user.click(photoContainer);
      }

      await waitFor(() => {
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Delete Photos')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[0];
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
      });
    });

    it('should handle bulk delete error', async () => {
      const user = userEvent.setup();

      server.use(
        http.delete(`${API_BASE}/photos/:id`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const images = screen.getAllByRole('img');
      const photoContainer = images[0].closest('div[class*="cursor-pointer"]');
      if (photoContainer) {
        await user.click(photoContainer);
      }

      await waitFor(() => {
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText('Delete'));

      await waitFor(() => {
        expect(screen.getByText('Delete Photos')).toBeInTheDocument();
      });

      const deleteConfirm = screen.getAllByRole('button').find(
        btn => btn.textContent === 'Delete Photos' && btn.closest('.fixed')
      );
      if (deleteConfirm) {
        await user.click(deleteConfirm);
      }

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // UPLOAD MODAL TESTS
  // ===========================================
  describe('Upload Modal', () => {
    it('should validate that at least one class is selected', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      // Trigger file select to open upload modal
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText('Upload Photos')).toBeInTheDocument();
      });

      // Try to upload without selecting a class
      const uploadButton = screen.getByText('Upload');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/select at least one class/i)).toBeInTheDocument();
      });
    });

    it('should display file count in upload modal', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText(/1 file.*selected/i)).toBeInTheDocument();
      });
    });

    it('should close upload modal on cancel', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByText(/Upload Photos/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/file.*selected/i)).not.toBeInTheDocument();
      });
    });

    it('should have caption input in upload modal', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });
      }

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Photo caption/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // CATEGORY MANAGEMENT TESTS
  // ===========================================
  describe('Category Management', () => {
    it('should open create category modal', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      await user.click(screen.getByText('New Category'));

      await waitFor(() => {
        expect(screen.getByText('Create Category')).toBeInTheDocument();
      });
    });

    it('should validate category name is required', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      await user.click(screen.getByText('New Category'));

      await waitFor(() => {
        expect(screen.getByText('Create Category')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Create');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Category name is required/i)).toBeInTheDocument();
      });
    });

    it('should create a new category', async () => {
      const user = userEvent.setup();

      let createdData: any = null;
      server.use(
        http.post(`${API_BASE}/photos/albums`, async ({ request }) => {
          createdData = await request.json();
          return HttpResponse.json({ id: 'new-album', ...createdData });
        })
      );

      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      await user.click(screen.getByText('New Category'));

      await waitFor(() => {
        expect(screen.getByText('Create Category')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/Category name/i);
      await user.type(nameInput, 'New Album');

      const descInput = screen.getByPlaceholderText(/Category description/i);
      await user.type(descInput, 'New album description');

      await user.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(createdData).toBeTruthy();
        expect(createdData.name).toBe('New Album');
      });
    });

    it('should close category modal on cancel', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      await user.click(screen.getByText('New Category'));

      await waitFor(() => {
        expect(screen.getByText('Create Category')).toBeInTheDocument();
      });

      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[0];
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Create Category')).not.toBeInTheDocument();
      });
    });

    it('should handle category creation error', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${API_BASE}/photos/albums`, () => {
          return HttpResponse.json({ message: 'Duplicate name' }, { status: 400 });
        })
      );

      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      await user.click(screen.getByText('New Category'));

      await waitFor(() => {
        expect(screen.getByText('Create Category')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/Category name/i);
      await user.type(nameInput, 'Test Category');

      await user.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(screen.getByText(/Failed to create/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty State', () => {
    it('should display empty state when no photos', async () => {
      server.use(
        http.get(`${API_BASE}/photos`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<PhotosManagement />);

      await waitFor(() => {
        expect(screen.getByText(/No photos found/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Upload photos to get started/i)).toBeInTheDocument();
    });

    it('should have upload button in empty state', async () => {
      server.use(
        http.get(`${API_BASE}/photos`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<PhotosManagement />);

      await waitFor(() => {
        expect(screen.getByText(/No photos found/i)).toBeInTheDocument();
      });

      const uploadButtons = screen.getAllByText('Upload Photos');
      expect(uploadButtons.length).toBeGreaterThanOrEqual(2); // Header + empty state
    });

    it('should display empty state when search has no results', async () => {
      const user = userEvent.setup();
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(3);
      });

      const searchInput = screen.getByPlaceholderText(/Search photos/i);
      await user.type(searchInput, 'nonexistent xyz');

      await waitFor(() => {
        expect(screen.getByText(/No photos found/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should display error when photos fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/photos`, () => {
          return HttpResponse.json({ message: 'Server error' }, { status: 500 });
        })
      );

      render(<PhotosManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
      });
    });

    it('should handle albums fetch failure gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/photos/albums`, () => {
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      render(<PhotosManagement />);

      // Page should still render without albums
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading States', () => {
    it('should display loading spinner while fetching', () => {
      render(<PhotosManagement />);

      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should hide loading after data loads', async () => {
      render(<PhotosManagement />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
      });

      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });
});
